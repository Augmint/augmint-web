import store from "modules/store";
import { fetchLoansForAddressTx, collectLoansTx, repayLoanTx } from "./loanTransactions";
import SolidityContract from "modules/ethereum/SolidityContract";
import { DECIMALS_DIV, LEGACY_LOANMANAGER_CONTRACTS } from "../../utils/constants";

export async function fetchActiveLegacyLoansForAddressTx(_userAccount) {
    const web3 = store.getState().web3Connect;
    const legacyLoanManagerAddresses = LEGACY_LOANMANAGER_CONTRACTS[web3.network.id];
    const userAccount = _userAccount.toLowerCase();

    const legacyLoanManagerContracts = legacyLoanManagerAddresses.map(address =>
        SolidityContract.connectAt(web3, "LoanManager", address)
    );

    const tokenAddressQueries = legacyLoanManagerContracts.map(contract =>
        contract.web3ContractInstance.methods.augmintToken().call()
    );

    const loanQueries = legacyLoanManagerContracts.map(contract =>
        fetchLoansForAddressTx(contract.web3ContractInstance, userAccount)
    );

    const [legacyLoans, tokenAddresses] = await Promise.all([
        Promise.all(loanQueries),
        Promise.all(tokenAddressQueries)
    ]);

    const balanceQueries = tokenAddresses.map(address => {
        const legacyTokenContract = SolidityContract.connectAt(web3, "TokenAEur", address);

        return legacyTokenContract.web3ContractInstance.methods.balanceOf(userAccount).call();
    });

    const balances = await Promise.all(balanceQueries);

    const ret = legacyLoans.map((loans, i) => ({
        address: legacyLoanManagerAddresses[i],
        tokenAddress: tokenAddresses[i],
        userAccount,
        userTokenBalance: balances[i] / DECIMALS_DIV,
        loans: loans.filter(loan => loan.isRepayable || loan.isCollectable)
    }));

    return ret;
}

export async function repayLegacyLoanTx(legacyLoanManagerAddress, repaymentAmount, loanId) {
    const web3 = store.getState().web3Connect;
    const legacyContract = SolidityContract.connectAt(web3, "LoanManager", legacyLoanManagerAddress);

    return repayLoanTx(legacyContract.web3ContractInstance, repaymentAmount, loanId);
}

export async function collectLegacyLoansTx(legacyLoanManagerAddress, loansToCollect) {
    const web3 = store.getState().web3Connect;
    const legacyContract = SolidityContract.connectAt(web3, "LoanManager", legacyLoanManagerAddress);

    return collectLoansTx(legacyContract.web3ContractInstance, loansToCollect);
}
