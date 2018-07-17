import store from "modules/store";
import BigNumber from "bignumber.js";
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
        let bn_outstandingLoansAmount = new BigNumber(0),
            bn_defaultedLoansAmount = new BigNumber(0),
            bn_collectedLoansAmount = new BigNumber(0),
            bn_collateralInEscrowEth = new BigNumber(0);

        loans.forEach(loan => {
            if (loan.collateralStatus === "in escrow") {
                bn_collateralInEscrowEth = bn_collateralInEscrowEth.plus(loan.collateralEth);
            }
            const loanState = LOAN_STATES[loan.state];
            switch (loanState) {
                case "Open":
                    bn_outstandingLoansAmount = bn_outstandingLoansAmount.plus(loan.loanAmount);
                    break;

                case "Defaulted":
                    bn_defaultedLoansAmount = bn_defaultedLoansAmount.plus(loan.loanAmount);
                    break;

                case "Collected":
                    bn_collectedLoansAmount = bn_collectedLoansAmount.plus(loan.loanAmount);
                    break;

                default:
                    break;
            }
        });
        return {
            address: loanManagerAddresses[i],
            tokenAddress: tokenAddresses[i],
            bn_outstandingLoansAmount,
            bn_defaultedLoansAmount,
            bn_collectedLoansAmount,
            bn_collateralInEscrowEth
        };
    });

    var bn_outstandingLoansAmount = new BigNumber(0),
        bn_defaultedLoansAmount = new BigNumber(0),
        bn_collectedLoansAmount = new BigNumber(0),
        bn_collateralInEscrowEth = new BigNumber(0);

    loanManagersValues.forEach(loanManagerValues => {
        bn_outstandingLoansAmount = bn_outstandingLoansAmount.plus(loanManagerValues.bn_outstandingLoansAmount);
        bn_defaultedLoansAmount = bn_defaultedLoansAmount.plus(loanManagerValues.bn_defaultedLoansAmount);
        bn_collectedLoansAmount = bn_collectedLoansAmount.plus(loanManagerValues.bn_collectedLoansAmount);
        bn_collateralInEscrowEth = bn_collateralInEscrowEth.plus(loanManagerValues.bn_collateralInEscrowEth);
    });

    return {
        loanManagersValues,
        outstandingLoansAmount: bn_outstandingLoansAmount.toNumber(),
        defaultedLoansAmount: bn_defaultedLoansAmount.toNumber(),
        collectedLoansAmount: bn_collectedLoansAmount.toNumber(),
        collateralInEscrowEth: bn_collateralInEscrowEth.toNumber()
    };
}
