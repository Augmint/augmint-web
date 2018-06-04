import store from "modules/store";
import BigNumber from "bignumber.js";
import { cost } from "./gas";
import { processTx } from "modules/ethereum/ethHelper";
import SolidityContract from "modules/ethereum/SolidityContract";
import { DECIMALS_DIV } from "utils/constants";

/* List of old augmint token deploy addresses by network id */
const ACCEPTED_LEGACY_AEUR_CONTRACTS = {
    // mainnet (no deploy yet)
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: ["0xe6a48098a0a318ccec66bcd8297417e0d74585dc"],

    // rinkeby
    4: [
        // "0x95aa79d7410eb60f49bfd570b445836d402bd7b1", // oldToken1 - DROPPED support on UI to convert to latest (monetarySupervisor would need to be NoFeeTransferContract on Token instead of latest feeAccount)
        "0xA35D9de06895a3A2E7eCaE26654b88Fe71C179eA", // oldToken2 https://github.com/Augmint/augmint-web/commit/1f66ee910f5186c38733e1196ac5d41260490d24
        "0x135893f1a6b3037bb45182841f18f69327366992", // oldToken3
        "0x6C90c10D7A33815C2BaeeD66eE8b848F1D95268e" // oldToken4
    ]
};

export async function fetchLegacyBalances() {
    const web3 = store.getState().web3Connect;
    const legacyTokenAddresses = ACCEPTED_LEGACY_AEUR_CONTRACTS[web3.network.id];
    const userAccount = store.getState().web3Connect.userAccount;

    const queryTxs = legacyTokenAddresses.map(address => {
        const legacyContract = SolidityContract.connectAt(web3, "TokenAEur", address);
        return legacyContract.web3ContractInstance.methods.balanceOf(userAccount).call();
    });

    const legacyBalances = await Promise.all(queryTxs);
    const ret = legacyBalances.map((bn_balance, i) => ({
        contract: legacyTokenAddresses[i],
        bn_balance,
        balance: bn_balance / DECIMALS_DIV
    }));

    return ret;
}

export async function convertLegacyBalanceTx(legacyTokenAddress, amount) {
    const txName = "Convert legacy balance";
    const web3 = store.getState().web3Connect;
    const monetarySupervisorAddress = store.getState().contracts.latest.monetarySupervisor.address;
    const gasEstimate = cost.LEGACY_BALANCE_CONVERT_GAS;
    const userAccount = store.getState().web3Connect.userAccount;

    const legacyContract = SolidityContract.connectAt(web3, "TokenAEur", legacyTokenAddress);

    const tx = legacyContract.web3ContractInstance.methods
        .transferAndNotify(monetarySupervisorAddress, new BigNumber(amount).mul(DECIMALS_DIV).toString(), 0)
        .send({
            from: userAccount,
            gas: gasEstimate
        });

    const transactionHash = await processTx(tx, txName, gasEstimate);
    return { txName, transactionHash };
}
