import store from "modules/store";
import { cancelOrderTx } from "./exchangeTransactions";
import SolidityContract from "modules/ethereum/SolidityContract";
import { Augmint } from "@augmint/js";

export async function fetchLegacyExchangeOrders() {
    //const legacyExchangeAddresses = LEGACY_EXCHANGE_CONTRACTS[web3.network.id];

    const augmint = store.getState().web3Connect.augmint;

    const legacyExchangeAddresses = Augmint.constants.SUPPORTED_LEGACY_EXCHANGES[augmint.environment];

    const legacyExchanges = augmint.getLegacyExchanges(legacyExchangeAddresses);

    const userAccount = store.getState().web3Connect.userAccount.toLowerCase();

    const queryTxs = legacyExchanges.map(legacyExchange => {
        return legacyExchange.getOrderBook();
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
