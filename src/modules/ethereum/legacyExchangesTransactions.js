import store from "modules/store";
import { fetchOrders, cancelOrderTx } from "./exchangeTransactions";
import SolidityContract from "modules/ethereum/SolidityContract";
import { LEGACY_EXCHANGE_CONTRACTS } from "utils/constants";

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
