import store from "modules/store";
import BigNumber from "bignumber.js";
import { fetchLoansTx } from "./loanTransactions";
import SolidityContract from "modules/ethereum/SolidityContract";
import {
    LEGACY_AEUR_CONTRACTS,
    LOAN_STATES,
    LEGACY_LOANMANAGER_CONTRACTS,
    LEGACY_LOCKER_CONTRACTS
} from "utils/constants";

export async function fetchAllTokensInfo() {
    const web3 = store.getState().web3Connect;
    const latestTokenAddress = store.getState().contracts.latest.augmintToken.address;
    const tokenAddresses = [latestTokenAddress, ...LEGACY_AEUR_CONTRACTS[web3.network.id]];

    const queries = tokenAddresses.map(tokenAddress => {
        const tokenContract = SolidityContract.connectAt(web3, "TokenAEur", tokenAddress);
        return Promise.all([
            tokenContract.web3ContractInstance.methods.totalSupply().call(),
            tokenContract.web3ContractInstance.methods.decimals().call()
        ]).then(([bn_totalSupply, decimals]) => {
            return bn_totalSupply / 10 ** decimals;
        });
    });

    return (await Promise.all(queries)).reduce(
        (res, totalSupply) => {
            res.totalSupply = res.totalSupply.plus(totalSupply);
            return res;
        },
        {
            totalSupply: new BigNumber(0)
        }
    );
}

export async function fetchAllMonetarySupervisorInfo() {
    const web3 = store.getState().web3Connect;
    const latestLockAddress = store.getState().contracts.latest.lockManager.address;
    const lockAddresses = [latestLockAddress, ...LEGACY_LOCKER_CONTRACTS[web3.network.id]];

    const queries = lockAddresses.map(lockAddress => {
        const lockContract = SolidityContract.connectAt(web3, "Locker", lockAddress);

        return lockContract.web3ContractInstance.methods
            .monetarySupervisor()
            .call()
            .then(monetarySupervisorAddress =>
                SolidityContract.connectAt(web3, "MonetarySupervisor", monetarySupervisorAddress)
            )
            .then(monetarySupervisor =>
                Promise.all([
                    monetarySupervisor.web3ContractInstance.methods.augmintReserves().call(),
                    monetarySupervisor.web3ContractInstance.methods
                        .augmintToken()
                        .call()
                        .then(augmintTokenAddress => SolidityContract.connectAt(web3, "TokenAEur", augmintTokenAddress))
                ])
            )
            .then(([reservesAddress, augmintToken]) =>
                Promise.all([
                    augmintToken.web3ContractInstance.methods.balanceOf(reservesAddress).call(),
                    augmintToken.web3ContractInstance.methods.decimals().call()
                ])
            )
            .then(([bn_reserveTokenBalance, decimals]) => {
                return bn_reserveTokenBalance / 10 ** decimals;
            });
    });

    return (await Promise.all(queries)).reduce(
        (res, reserveTokenBalance) => {
            res.reserveTokenBalance = res.reserveTokenBalance.plus(reserveTokenBalance);
            return res;
        },
        {
            reserveTokenBalance: new BigNumber(0)
        }
    );
}

export async function fetchAllLoansInfo() {
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
