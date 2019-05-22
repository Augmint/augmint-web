import store from "modules/store";
import { cancelOrderTx } from "./exchangeTransactions";
import SolidityContract from "modules/ethereum/SolidityContract";
import { Augmint } from "@augmint/js";

export async function fetchLegacyExchangeOrders() {
    const augmint = store.getState().web3Connect.augmint;

    const legacyExchangeAddresses = Augmint.constants.SUPPORTED_LEGACY_EXCHANGES[augmint.deployedEnvironment.name];

    const legacyExchanges = augmint.getLegacyExchanges(legacyExchangeAddresses);

    const userAccount = store.getState().web3Connect.userAccount.toLowerCase();
    const isMyOrder = order => order.maker.toLowerCase() === userAccount;

    const queryTxs = legacyExchanges.map(e => e.getOrderBook());

    const legacyOrders = await Promise.all(queryTxs);

    const ret = legacyOrders.map((orders, i) => {
        const userBuyOrders = orders.buyOrders.filter(isMyOrder).map(o => Object.assign(o, { buy: true }));
        const userSellOrders = orders.sellOrders.filter(isMyOrder).map(o => Object.assign(o, { buy: false }));
        const userOrders = userBuyOrders.concat(userSellOrders);

        return {
            address: legacyExchangeAddresses[i],
            userOrders
        };
    });

    return ret;
}

export async function cancelLegacyExchangeOrderTx(legacyTokenAddress, buy, orderId) {
    const web3 = store.getState().web3Connect;
    const legacyContract = SolidityContract.connectAt(web3, "Exchange", legacyTokenAddress);

    return cancelOrderTx(legacyContract.web3ContractInstance, buy, orderId);
}
