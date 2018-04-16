import store from "modules/store";
import BigNumber from "bignumber.js";
import { cost } from "./gas";
import { processTx } from "modules/ethereum/ethHelper";
import AugmintToken from "contractsBuild/TokenAEur.json";
import MonetarySupervisor from "contractsBuild/MonetarySupervisor.json";
import { default as Contract } from "truffle-contract";
import { DECIMALS_DIV } from "utils/constants";

/* List of old augmint token deploy addresses by network id */
const ACCEPTED_LEGACY_AEUR_CONTRACTS = {
    // mainnet (no deploy yet)
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: ["0x5d77f09a3703be84d84810379067a6d9ad759582"],

    // rinkeby
    4: [
        "0xA35D9de06895a3A2E7eCaE26654b88Fe71C179eA" //https://github.com/Augmint/augmint-web/commit/1f66ee910f5186c38733e1196ac5d41260490d24
    ]
};

export async function fetchLegacyBalances() {
    const web3 = store.getState().web3Connect;
    const legacyTokenAddresses = ACCEPTED_LEGACY_AEUR_CONTRACTS[web3.network.id];
    const userAccount = store.getState().web3Connect.userAccount;

    const contract = Contract(AugmintToken);
    contract.setProvider(web3.web3Instance.currentProvider);
    contract.setNetwork(web3.network.id);

    const queryTxs = legacyTokenAddresses.map(address => contract.at(address).balanceOf(userAccount));

    const legacyBalances = await Promise.all(queryTxs);
    const ret = legacyBalances.map((bal, i) => ({
        contract: legacyTokenAddresses[i],
        bn_balance: bal,
        balance: bal.div(DECIMALS_DIV).toNumber()
    }));

    return ret;
}

export async function convertLegacyBalanceTx(legacyTokenAddress, amount) {
    const txName = "Convert legacy balance";
    const web3 = store.getState().web3Connect;
    const gasEstimate = cost.LEGACY_BALANCE_CONVERT_GAS;
    const userAccount = store.getState().web3Connect.userAccount;
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

    const augmintTokenContract = Contract(AugmintToken);

    const monetarySupervisorContract = Contract(MonetarySupervisor);
    monetarySupervisorContract.setProvider(web3.web3Instance.currentProvider);
    monetarySupervisorContract.setNetwork(web3.network.id);

    const web3ContractInstance = new web3.web3Instance.eth.Contract(augmintTokenContract.abi, legacyTokenAddress);

    const tx = web3ContractInstance.methods
        .transferAndNotify(monetarySupervisorContract.address, new BigNumber(amount).mul(decimalsDiv).toString(), 0)
        .send({
            from: userAccount,
            gas: gasEstimate
        });

    const transactionHash = await processTx(tx, txName, gasEstimate);
    return { txName, transactionHash };
}
