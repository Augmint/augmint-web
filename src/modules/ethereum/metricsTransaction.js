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

async function fetchTokenInfo(tokenAddress) {
    const web3 = store.getState().web3Connect;
    const tokenContract = SolidityContract.connectAt(web3, "TokenAEur", tokenAddress);
    const tokenInstance = tokenContract.web3ContractInstance;
    const feeAccountAddress = await tokenInstance.methods.feeAccount().call();

    const [bn_totalSupply, bn_feeAccountTokenBalance, decimals] = await Promise.all([
        tokenInstance.methods.totalSupply().call(),
        tokenInstance.methods.balanceOf(feeAccountAddress).call(),
        tokenInstance.methods.decimals().call()
    ]);

    return {
        totalSupply: bn_totalSupply / 10 ** decimals,
        feeAccountTokenBalance: bn_feeAccountTokenBalance / 10 ** decimals
    };
}

export async function fetchAllTokensInfo() {
    const web3 = store.getState().web3Connect;
    const latestTokenAddress = store.getState().contracts.latest.augmintToken.address;
    const tokenAddresses = [latestTokenAddress, ...LEGACY_AEUR_CONTRACTS[web3.network.id]];
    const queries = tokenAddresses.map(fetchTokenInfo);

    return (await Promise.all(queries)).reduce(
        (res, { totalSupply, feeAccountTokenBalance }) => {
            res.totalSupply = res.totalSupply.plus(totalSupply);
            res.feeAccountTokenBalance = res.feeAccountTokenBalance.plus(feeAccountTokenBalance);
            return res;
        },
        {
            totalSupply: new BigNumber(0),
            feeAccountTokenBalance: new BigNumber(0)
        }
    );
}

async function fetchMonetarySupervisorInfo(lockAddress) {
    const web3 = store.getState().web3Connect;
    const lockContract = SolidityContract.connectAt(web3, "Locker", lockAddress);
    const monetarySupervisorAddress = await lockContract.web3ContractInstance.methods.monetarySupervisor().call();
    const monetarySupervisorContract = SolidityContract.connectAt(
        web3,
        "MonetarySupervisor",
        monetarySupervisorAddress
    );
    const monetarySupervisorInstance = monetarySupervisorContract.web3ContractInstance;

    const [tokenAddress, interestEarnedAccountAddress, reservesAddress, bn_issuedByStabilityBoard] = await Promise.all([
        monetarySupervisorInstance.methods.augmintToken().call(),
        monetarySupervisorInstance.methods.interestEarnedAccount().call(),
        monetarySupervisorInstance.methods.augmintReserves().call(),
        monetarySupervisorInstance.methods.issuedByStabilityBoard
            ? monetarySupervisorInstance.methods.issuedByStabilityBoard().call()
            : 0
    ]);

    const tokenContract = SolidityContract.connectAt(web3, "TokenAEur", tokenAddress);
    const tokenInstance = tokenContract.web3ContractInstance;

    const [bn_interestEarnedAccountTokenBalance, bn_reserveTokenBalance, decimals] = await Promise.all([
        tokenInstance.methods.balanceOf(interestEarnedAccountAddress).call(),
        tokenInstance.methods.balanceOf(reservesAddress).call(),
        tokenInstance.methods.decimals().call()
    ]);

    return {
        interestEarnedAccountTokenBalance: bn_interestEarnedAccountTokenBalance / 10 ** decimals,
        reserveTokenBalance: bn_reserveTokenBalance / 10 ** decimals,
        issuedByStabilityBoard: bn_issuedByStabilityBoard / 10 ** decimals
    };
}

export async function fetchAllMonetarySupervisorInfo() {
    const web3 = store.getState().web3Connect;
    const latestLockAddress = store.getState().contracts.latest.lockManager.address;
    const lockAddresses = [latestLockAddress, ...LEGACY_LOCKER_CONTRACTS[web3.network.id]];
    const queries = lockAddresses.map(fetchMonetarySupervisorInfo);

    return (await Promise.all(queries)).reduce(
        (res, { interestEarnedAccountTokenBalance, reserveTokenBalance, issuedByStabilityBoard }) => {
            res.interestEarnedAccountTokenBalance = res.interestEarnedAccountTokenBalance.plus(
                interestEarnedAccountTokenBalance
            );
            res.reserveTokenBalance = res.reserveTokenBalance.plus(reserveTokenBalance);
            res.issuedByStabilityBoard = res.issuedByStabilityBoard.plus(issuedByStabilityBoard);
            return res;
        },
        {
            interestEarnedAccountTokenBalance: new BigNumber(0),
            reserveTokenBalance: new BigNumber(0),
            issuedByStabilityBoard: new BigNumber(0)
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
