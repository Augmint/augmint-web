import store from "modules/store";
import { fetchLoansForAddressTx, collectLoansTx, repayLoanTx } from "./loanTransactions";
import SolidityContract from "modules/ethereum/SolidityContract";
import { DECIMALS_DIV } from "../../utils/constants";

/* List of old augmint token deploy addresses by network id */
const LEGACY_LOANMANAGER_CONTRACTS = {
    // mainnet (no deploy yet)
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: ["0xf7b8384c392fc333d3858a506c4f1506af44d53c"],

    // rinkeby
    4: [
        // too old version, no CHUNK_SIZE(), didn't bother to make compatible: "0xfb505462633ae3234760d0ee51c557199ab249df",
        "0xec5e35d8941386c3e08019b0ad1d4a8c40c7bcbc",
        "0xbdb02f82d7ad574f9f549895caf41e23a8981b07"
    ]
};

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
