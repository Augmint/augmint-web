import store from "modules/store";
import BigNumber from "bignumber.js";
import { fetchLoansTx } from "./loanTransactions";
import SolidityContract from "modules/ethereum/SolidityContract";
import {
    LEGACY_AEUR_CONTRACTS,
    LOAN_STATES,
    LEGACY_LOANMANAGER_CONTRACTS,
    LEGACY_FEE_CONTRACTS,
    LEGACY_MONETARY_SUPERVISOR_CONTRACTS,
    LEGACY_RESERVES_CONTRACTS,
    LEGACY_INTEREST_EARNED_CONTRACTS
} from "utils/constants";

function sum(arr, funcName) {
    console.log(funcName);
    console.log(arr);
    arr.forEach(item => console.log(item, typeof item));
    return arr.reduce((res, item) => res.plus(item), new BigNumber(0));
}

async function fetchTokenBalance({ address, tokenAddress }) {
    const web3 = store.getState().web3Connect;
    const tokenInstance = SolidityContract.connectAt(web3, "TokenAEur", tokenAddress).web3ContractInstance;

    const [bn_balance, decimals] = await Promise.all([
        tokenInstance.methods.balanceOf(address).call(),
        tokenInstance.methods.decimals().call()
    ]);

    return bn_balance / 10 ** decimals;
}

async function fetchEthBalance({ address }) {
    const web3 = store.getState().web3Connect;
    const bn_balance = await web3.web3Instance.eth.getBalance(address);
    return web3.web3Instance.utils.fromWei(bn_balance);
}

async function fetchTokenInfo(tokenAddress) {
    const web3 = store.getState().web3Connect;
    const tokenInstance = SolidityContract.connectAt(web3, "TokenAEur", tokenAddress).web3ContractInstance;

    const [bn_totalSupply, decimals] = await Promise.all([
        tokenInstance.methods.totalSupply().call(),
        tokenInstance.methods.decimals().call()
    ]);

    return bn_totalSupply / 10 ** decimals;
}

export async function fetchAllTokensInfo() {
    const web3 = store.getState().web3Connect;
    const latestToken = store.getState().augmintToken;

    return {
        totalSupply: sum(
            [
                latestToken.info.totalSupply,
                ...(await Promise.all(LEGACY_AEUR_CONTRACTS[web3.network.id].map(fetchTokenInfo)))
            ],
            "totalSupply:"
        ),
        feeAccountTokenBalance: sum(
            [
                latestToken.info.feeAccountTokenBalance,
                ...(await Promise.all(LEGACY_FEE_CONTRACTS[web3.network.id].map(fetchTokenBalance)))
            ],
            "feeAccountTokenBalance:"
        ),
        feeAccountEthBalance: sum(
            [
                latestToken.info.feeAccountEthBalance,
                ...(await Promise.all(LEGACY_FEE_CONTRACTS[web3.network.id].map(fetchEthBalance)))
            ],
            "feeAccountEthBalance:"
        )
    };
}

async function fetchMonetarySupervisorInfo(msAddress) {
    const web3 = store.getState().web3Connect;
    const msInstance = SolidityContract.connectAt(web3, "MonetarySupervisor", msAddress).web3ContractInstance;

    const [bn_issuedByStabilityBoard, decimals] = await Promise.all([
        msInstance.methods.issuedByStabilityBoard().call(),
        100 // decimals_div
    ]);

    return bn_issuedByStabilityBoard / 10 ** decimals;
}

export async function fetchAllMonetarySupervisorInfo() {
    const web3 = store.getState().web3Connect;
    const latestMs = store.getState().monetarySupervisor;

    return {
        issuedByStabilityBoard: sum(
            [
                latestMs.info.issuedByStabilityBoard,
                ...(await Promise.all(
                    LEGACY_MONETARY_SUPERVISOR_CONTRACTS[web3.network.id].map(fetchMonetarySupervisorInfo)
                ))
            ],
            "issuedByStabilityBoard:"
        ),
        reserveTokenBalance: sum(
            [
                latestMs.info.reserveTokenBalance,
                ...(await Promise.all(LEGACY_RESERVES_CONTRACTS[web3.network.id].map(fetchTokenBalance)))
            ],
            "reserveTokenBalance:"
        ),
        reserveEthBalance: sum(
            [
                latestMs.info.reserveEthBalance,
                ...(await Promise.all(LEGACY_RESERVES_CONTRACTS[web3.network.id].map(fetchEthBalance)))
            ],
            "reserveEthBalance:"
        ),
        interestEarnedAccountTokenBalance: sum(
            [
                latestMs.info.interestEarnedAccountTokenBalance,
                ...(await Promise.all(LEGACY_INTEREST_EARNED_CONTRACTS[web3.network.id].map(fetchTokenBalance)))
            ],
            "interestEarnedAccountTokenBalance:"
        )
    };
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
