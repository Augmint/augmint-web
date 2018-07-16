import store from "modules/store";
import { fetchLoansTx } from "./loanTransactions";
import SolidityContract from "modules/ethereum/SolidityContract";
import { LOAN_STATES, LEGACY_LOANMANAGER_CONTRACTS } from "utils/constants";

export async function fetchActiveLegacyLoansTx() {
    const web3 = store.getState().web3Connect;
    const currentLoanManagerAddress = store.getState().contracts.latest.loanManager.address;
    const loanManagerAddresses = [currentLoanManagerAddress, ...LEGACY_LOANMANAGER_CONTRACTS[web3.network.id]];

    const legacyLoanManagerContracts = loanManagerAddresses.map(address =>
        SolidityContract.connectAt(web3, "LoanManager", address)
    );

    const tokenAddressQueries = legacyLoanManagerContracts.map(contract =>
        contract.web3ContractInstance.methods.augmintToken().call()
    );

    const loanQueries = legacyLoanManagerContracts.map(contract => fetchLoansTx(contract.web3ContractInstance));

    const [legacyLoans, tokenAddresses] = await Promise.all([
        Promise.all(loanQueries),
        Promise.all(tokenAddressQueries)
    ]);

    const loanManagersValues = legacyLoans.map((loans, i) => {
        let outstandingLoansAmount = 0,
            defaultedLoansAmount = 0,
            collectedLoansAmount = 0,
            collateralInEscrowEth = 0;

        loans.forEach(loan => {
            if (loan.collateralStatus === "in escrow") {
                collateralInEscrowEth += loan.collateralEth;
            }
            const loanState = LOAN_STATES[loan.state];
            switch (loanState) {
                case "Open":
                    outstandingLoansAmount += loan.loanAmount;
                    break;

                case "Defaulted":
                    defaultedLoansAmount += loan.loanAmount;
                    break;

                case "Collected":
                    collectedLoansAmount += loan.loanAmount;
                    break;

                default:
                    break;
            }
        });
        return {
            address: loanManagerAddresses[i],
            tokenAddress: tokenAddresses[i],
            outstandingLoansAmount,
            defaultedLoansAmount,
            collectedLoansAmount,
            collateralInEscrowEth
        };
    });

    var outstandingLoansAmount = 0,
        defaultedLoansAmount = 0,
        collectedLoansAmount = 0,
        collateralInEscrowEth = 0;

    loanManagersValues.forEach(loanManagerValues => {
        outstandingLoansAmount += loanManagerValues.outstandingLoansAmount;
        defaultedLoansAmount += loanManagerValues.defaultedLoansAmount;
        collectedLoansAmount += loanManagerValues.collectedLoansAmount;
        collateralInEscrowEth += loanManagerValues.collateralInEscrowEth;
    });

    return {
        loanManagersValues,
        outstandingLoansAmount,
        defaultedLoansAmount,
        collectedLoansAmount,
        collateralInEscrowEth
    };
}
