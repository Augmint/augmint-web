import store from "modules/store";
import { fetchOrders, cancelOrderTx } from "./exchangeTransactions";
import SolidityContract from "modules/ethereum/SolidityContract";

/* List of old augmint token deploy addresses by network id */
const LEGACY_EXCHANGE_CONTRACTS = {
    // mainnet
    1: [
        "0x8b52b019d237d0bbe8Baedf219132D5254e0690b", // initial Exchange, replaced by 0xeae7d30bcd44f27d58985b56add007fcee254abd
        "0xeae7d30bcd44f27d58985b56add007fcee254abd" // replaced by 0.6.1 at 0xaFEA54baDf7A68F93C2235B5F4cC8F02a2b55Edd
    ],

    // local ganache (migrations deploys it for manual testing)
    999: ["0x9f5420ec1348df8de8c85dab8d240ace122204c5"],

    // rinkeby
    4: [
        "0x65d30e5a6191a507fda96341f6ba773c4224c0e1",
        "0x03fe291f8a30e54cd05459f368d554b40784ca78",
        "0x86abc21cbb508fcb303f881d6871e4f870ce041a",
        "0xc5b604f8e046dff26642ca544c9eb3064e02ecd9",
        "0x5e2Be81aB4237c7c08d929c42b9F13cF4f9040D2",
        "0x5c35162dbf91c794f1569c5fe1649f0c5283d2f6"
    ]
};

export async function fetchLegacyExchangeOrders() {
    const web3 = store.getState().web3Connect;
    const legacyExchangeAddresses = LEGACY_EXCHANGE_CONTRACTS[web3.network.id];
    const userAccount = store.getState().web3Connect.userAccount.toLowerCase();

    const queryTxs = legacyExchangeAddresses.map(address => {
        const legacyContract = SolidityContract.connectAt(web3, "Exchange", address);

        return fetchOrders(legacyContract.web3ContractInstance);
    });

    const legacyOrders = await Promise.all(queryTxs);

    const ret = legacyOrders.map((orders, i) => {
        const userBuyOrders = orders.buyOrders.filter(order => order.maker.toLowerCase() === userAccount);
        const userSellOrders = orders.sellOrders.filter(order => order.maker.toLowerCase() === userAccount);
        const userOrders = userBuyOrders.concat(userSellOrders);

        return {
            address: legacyExchangeAddresses[i],
            userOrders
        };
    });

    return ret;
}

export async function cancelLegacyExchangeOrderTx(legacyTokenAddress, direction, orderId) {
    const web3 = store.getState().web3Connect;
    const legacyContract = SolidityContract.connectAt(web3, "Exchange", legacyTokenAddress);

    return cancelOrderTx(legacyContract.web3ContractInstance, direction, orderId);
}
