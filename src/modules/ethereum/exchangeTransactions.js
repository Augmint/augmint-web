import store from "modules/store";
import BigNumber from "bignumber.js";
import { ETHSELL, TOKENSELL } from "modules/reducers/orders";
import { cost } from "./gas";

export async function fetchOrders() {
    // FIXME: what to do if orders changes while iterating?
    try {
        let exchange = store.getState().exchange.contract.instance;
        let web3 = store.getState().web3Connect.web3Instance;
        let orders = [];
        let order = await exchange.iterateOpenOrders(0); // returns first open order
        let nextOrderId = 999;
        while (order[0] > 0 && nextOrderId > 0) {
            let orderType = order[3].toNumber();
            let bn_amount, ccy;
            if (orderType === TOKENSELL) {
                ccy = "ACE";
                bn_amount = order[4].div(10000);
            } else if (orderType === ETHSELL) {
                ccy = "ETH";
                bn_amount = new BigNumber(web3.utils.fromWei(order[4].toString()));
            } else {
                throw new Error("Unknown orderType: " + orderType);
            }
            let amount = bn_amount.toString();
            orders.push({
                orderId: order[0].toNumber(),
                maker: order[1],
                makerOrderIdx: order[2].toNumber(),
                orderType: orderType,
                bn_amount: bn_amount,
                amount: amount,
                ccy: ccy
            });

            nextOrderId = order[5];
            if (nextOrderId > 0) {
                order = await exchange.iterateOpenOrders(nextOrderId);
            }
        }
        return orders;
    } catch (error) {
        throw new Error("fetchOrders failed.\n" + error);
    }
}

export async function placeOrderTx(orderType, amount) {
    try {
        let gasEstimate = cost.PLACE_ORDER_GAS;
        let userAccount = store.getState().web3Connect.userAccount;
        let exchange = store.getState().exchange.contract.instance;
        let submitAmount, result;

        switch (orderType) {
            case ETHSELL:
                let web3 = store.getState().web3Connect.web3Instance;
                submitAmount = web3.utils.toWei(amount.toString());
                result = await exchange.placeSellEthOrder({
                    value: submitAmount,
                    from: userAccount,
                    gas: gasEstimate
                });
                break;
            case TOKENSELL:
                let augmintToken = store.getState().augmintToken;
                submitAmount = amount.times(augmintToken.info.bn_decimalsDiv).toString(); // from truffle-contract 3.0.0 passing bignumber.js BN throws "Invalid number of arguments to Solidity function". should migrate to web3's BigNumber....
                result = await exchange.placeSellTokenOrder(submitAmount, {
                    from: userAccount,
                    gas: gasEstimate
                });
                break;
            default:
                throw new Error("Unknown orderType: " + orderType);
        }

        if (result.receipt.gasUsed === gasEstimate) {
            // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw new Error("Place order failed. All gas provided was used:  " + result.receipt.gasUsed);
        }

        /* TODO:  process events properly for display (full new order, partly filled, fully filled) */

        if (
            !result.logs ||
            !result.logs[0] ||
            (result.logs[0].event !== "e_newOrder" && result.logs[0].event !== "e_orderFill")
        ) {
            throw new Error("e_newOrder or e_orderFill event wasn't received. Check tx :  " + result.tx);
        }

        //let bn_amount = result.logs[0].args.amount.div(new BigNumber(10000));
        return {
            txResult: result,
            orderId: "TODO",
            eth: {
                gasProvided: gasEstimate,
                gasUsed: result.receipt.gasUsed,
                tx: result.tx
            }
        };
    } catch (error) {
        console.error("Place order failed.\n", error);
        throw new Error("Place order failed.\n" + error);
    }
}
