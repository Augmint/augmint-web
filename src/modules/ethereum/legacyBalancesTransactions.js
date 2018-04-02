import store from "modules/store";
//import BigNumber from "bignumber.js";
//import { cost } from "./gas";
//import { EthereumTransactionError, processTx } from "modules/ethereum/ethHelper";
//import { ONE_ETH_IN_WEI } from "../../utils/constants";
//import AugmintToken from "contractsBuild/AugmintToken.json";
import AugmintToken from "contractsBuild/TokenAEur.json";
import { default as Contract } from "truffle-contract";
import { DECIMALS_DIV } from "utils/constants";

/* List of old augmint token deploy addresses by network id */
const ACCEPTED_LEGACY_AEUR_CONTRACTS = {
    1: [], // mainnet (no deploy yet)
    999: ["0x2b464feba90a9c1fcf74ebdb15471b539ba1d9d4"], // local ganache (migrations deploys it for manual testing)
    4: ["0xA35D9de06895a3A2E7eCaE26654b88Fe71C179eA"] // rinkeby
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

export async function convertLegacyBalanceTx() {
    throw new Error("not implemented yet");
}
