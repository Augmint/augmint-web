/* Contract to manage Acd loan contracts
    TODO: add loanId to disbursement, repay and collection narrative
    TODO: check if we could do repayment without "direct" access to borrower's balance (i.e. systemTransfer)
           eg. transfer Acd to EthBackedLoan initiates repayment? or using ECR20 transfer approval?
           it wouldn't restrict access more but would be better seperation of functions
*/
pragma solidity ^0.4.18;
import "./Owned.sol";
import "./SafeMath.sol";
import "./Rates.sol";
import "./TokenAcd.sol";
import "./EthBackedLoan.sol";


contract LoanManager is owned {
    using SafeMath for uint256;

    Rates public rates; // instance of ETH/USD rate provider contract
                        // TODO:  setter to be able to change? (consider trust questions)
    TokenAcd public tokenUcd; // instance of UCD token contract

    struct Product {
        uint term;
        uint discountRate; // discountRate in parts per million , ie. 10,000 = 1%
        uint loanCollateralRatio;  // ucd loan amount / colleteral usd value
                                    // in parts per million , ie. 10,000 = 1%
        uint minDisbursedAmountInUcd; // with 4 decimals, ie. 31000 = 3.1UCD
        uint repayPeriod; // number of seconds after maturity before collect can be executed
        bool isActive;
    }

    Product[] public products;

    enum LoanState { Open, Repaid, Defaulted }

    struct LoanPointer {
        address contractAddress;
        LoanState loanState;    // Redundant, stored in loan contract as well but saves us to instantiate each contract
                                //   when need to iterate through
    }

    LoanPointer[] public loanPointers;
    mapping(address => uint[]) public m_loanPointers;  // owner account address =>  array of loanContracts array idx-s (idx + 1)

    function LoanManager(address _tokenUcdAddress, address _ratesAddress) public owned() {
        tokenUcd = TokenAcd(_tokenUcdAddress);
        rates = Rates(_ratesAddress);
    }

    function getLoanCount() external view returns (uint ct) {
        return loanPointers.length;
    }

    function getProductCount() external view returns (uint ct) {
        return products.length;
    }

    function getLoanIds(address borrower) external view returns (uint[] loans) {
        return m_loanPointers[borrower];
    }

    function addProduct(uint _term, uint _discountRate, uint _loanCollateralRatio, uint _minDisbursedAmountInUcd,
            uint _repayPeriod, bool _isActive) external onlyOwner returns (uint newProductId) {
        newProductId = products.push(
            Product(
                {term: _term, discountRate: _discountRate,
                loanCollateralRatio: _loanCollateralRatio, minDisbursedAmountInUcd: _minDisbursedAmountInUcd,
                repayPeriod: _repayPeriod, isActive: _isActive}
            )
        );

        return newProductId - 1;
        // TODO: emit event
    }

    function disableProduct(uint8 productId) external onlyOwner {
        products[productId].isActive = false;
        // TODO: emit event
    }

    function enableProduct(uint8 productId) external onlyOwner {
        products[productId].isActive = true;
        // TODO: emit event
    }

    event e_newLoan(uint8 productId, uint loanId, address borrower, address loanContract, uint disbursedLoanInUcd);

    function newEthBackedLoan(uint8 productId) external payable {
        require(products[productId].isActive); // valid productId?

        // calculate UCD loan values based on ETH sent in with Tx
        uint usdcValue = rates.convertWeiToUsdc(msg.value);
        uint loanAmount = usdcValue.mul(products[productId].loanCollateralRatio).roundedDiv(100000000);
        loanAmount = loanAmount * 100;  // rounding 4 decimals value to 2 decimals.
                                                    // no safe mul needed b/c of prev divide

        uint mul = products[productId].loanCollateralRatio.mul(products[productId].discountRate) / 1000000;
        uint disbursedAmount = usdcValue.mul(mul).roundedDiv(100000000);
        disbursedAmount = disbursedAmount * 100;  // rounding 4 decimals value to 2 decimals.
                                                        // no safe mul needed b/c of prev divide

        require(disbursedAmount >= products[productId].minDisbursedAmountInUcd);

        // Create new loan contract
        uint loanId = loanPointers.push(LoanPointer(address(0), LoanState.Open)) - 1;
        // TODO: check if it's better to pass productId or Product struct
        address loanContractAddress = new EthBackedLoan(loanId, msg.sender, products[productId].term,
                    disbursedAmount, loanAmount, products[productId].repayPeriod);
        loanPointers[loanId].contractAddress = loanContractAddress;

        // Store ref to new loan contract in this contract
        m_loanPointers[msg.sender].push(loanId);

        // Send ETH collateral to loan contract
        loanContractAddress.transfer(msg.value);

        // Issue UCD and send to borrower
        // tokenUcd.issueAndDisburse( msg.sender, ucdDueAtMaturity, disbursedLoanInUcd, "Loan disbursement");
        /* Alternative to issueAndDisburse: */
        tokenUcd.issue(loanAmount);
        // TODO: interest should go to Interest Pool
        tokenUcd.transferNoFee(address(tokenUcd), msg.sender, disbursedAmount, "Loan disbursement");

        e_newLoan(productId, loanId, msg.sender, loanContractAddress, disbursedAmount);
    }

    event e_repayed(address loanContractAddress, address borrower);

    function repay(uint loanId) external {
        // TODO: remove contract from loanPointers & m_loanPointer on SUCCESS
        require(loanPointers[loanId].loanState == LoanState.Open);

        address loanContractAddress = loanPointers[loanId].contractAddress;
        EthBackedLoan loanContract = EthBackedLoan(loanContractAddress);

        require(loanContract.owner() == msg.sender);

        // tokenUcd.repayAndBurn(msg.sender, loanContract.ucdDueAtMaturity(),
        //                   loanContract.disbursedLoanInUcd(), "Loan repayment");
        /* Alternative to repayAndBurn: */
        tokenUcd.transferNoFee(msg.sender, address(tokenUcd), loanContract.ucdDueAtMaturity(), "Loan repayment");
        tokenUcd.burn(loanContract.ucdDueAtMaturity());
        loanContract.releaseCollateral();

        loanPointers[loanId].loanState = LoanState.Repaid;
        e_repayed(loanContractAddress, loanContract.owner());
    }

    event e_collected(address borrower, address loanContractAddress);

    function collect(uint[] loanIds) external {
        /* when there are a lots of loans to be collected then
             the client need to call it in batches to make sure tx won't exceed block gas limit.
         Anyone can call it - can't cause harm as it only allows to collect loans which they are defaulted
         TODO: remove contract from loanPointers & m_loanPointer on SUCCESS
        */
        for (uint i = 0; i < loanIds.length; i++) {
            uint loanId = loanIds[i];
            require(loanPointers[loanId].loanState == LoanState.Open);

            address loanContractAddress = loanPointers[loanId].contractAddress;
            EthBackedLoan loanContract = EthBackedLoan(loanContractAddress);

            loanContract.collect();
            loanPointers[loanId].loanState = LoanState.Defaulted;
            e_collected(loanContract.owner(), loanContractAddress);
        }

    }

}
