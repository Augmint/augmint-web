import store from "modules/store";
import ethers from "ethers";
import moment from "moment";
import BigNumber from "bignumber.js";
import { ONE_ETH_IN_WEI, DECIMALS_DIV, PPM_DIV, DECIMALS } from "utils/constants";
import { floatNumberConverter } from "utils/converter";

export async function fetchTradesTx(account, fromBlock, toBlock) {
    try {
        const exchangeInstance = store.getState().contracts.latest.exchange.ethersInstance;
        const NewOrder = exchangeInstance.interface.events.NewOrder;
        const OrderFill = exchangeInstance.interface.events.OrderFill;
        const CancelledOrder = exchangeInstance.interface.events.CancelledOrder;
        const provider = store.getState().web3Connect.ethers.provider;

        const paddedAccount = ethers.utils.hexlify(ethers.utils.padZeros(account, 32));
        const [logsNewOrder, logsOrderFillBuy, logsOrderFillSell, logsCanceledOrder] = await Promise.all([
            provider.getLogs({
                fromBlock: fromBlock,
                toBlock: toBlock,
                address: exchangeInstance.address,
                topics: [NewOrder.topics[0], null, paddedAccount]
            }),
            provider.getLogs({
                fromBlock: fromBlock,
                toBlock: toBlock,
                address: exchangeInstance.address,
                topics: [OrderFill.topics[0], paddedAccount]
            }),
            provider.getLogs({
                fromBlock: fromBlock,
                toBlock: toBlock,
                address: exchangeInstance.address,
                topics: [OrderFill.topics[0], null, paddedAccount]
            }),
            provider.getLogs({
                fromBlock: fromBlock,
                toBlock: toBlock,
                address: exchangeInstance.address,
                topics: [CancelledOrder.topics[0], null, paddedAccount]
            })
        ]);

        console.log("BEFOREFORMAT logsOrderFillBuy:", logsOrderFillBuy);

        const logs = await Promise.all([
            ...logsNewOrder.map(eventLog => _formatTradeLog(NewOrder, account, eventLog)),
            ...logsCanceledOrder.map(eventLog => _formatTradeLog(CancelledOrder, account, eventLog)),
            ...logsOrderFillBuy.map(eventLog => _formatTradeLog(OrderFill, account, eventLog, "buy")),
            ...logsOrderFillSell.map(eventLog => _formatTradeLog(OrderFill, account, eventLog, "sell"))
        ]);

        logs.sort((log1, log2) => {
            return log2.blockData.timestamp - log1.blockData.timestamp;
        });

        console.log("logsOrderFillBuy: ", logsOrderFillBuy);
        console.log("LOGS: ", logs);

        return logs;
    } catch (error) {
        throw new Error("fetchTradesTx failed.\n" + error);
    }
}

export async function processNewTradeTx(eventName, account, eventLog, type) {
    const exchangeInstance = store.getState().contracts.latest.exchange.ethersInstance;
    const event = exchangeInstance.interface.events[eventName];

    return _formatTradeLog(event, account, eventLog, type);
}

async function _formatTradeLog(event, account, eventLog, type) {
    let blockData;

    console.log("EVENTLOG: ", eventLog);
    console.log("EVENT: ", event);

    if (typeof eventLog.getBlock === "function") {
        // called from event - need to use this.getBlock b/c block is available on Infura later than than tx receipt (Infura  node syncing)
        blockData = await eventLog.getBlock();
    } else {
        // not from event, provider.getBlock should work
        const provider = store.getState().web3Connect.ethers.provider;
        blockData = await provider.getBlock(eventLog.blockNumber);
        // console.log("blockData ELSE: ", blockData);
    }

    const parsedData = event.parse(eventLog.topics, eventLog.data);
    const blockTimeStampText = blockData ? moment.unix(await blockData.timestamp).format("D MMM YYYY HH:mm") : "?";

    console.log("parsedData: ", parsedData);

    const bn_weiAmount = new BigNumber(parsedData.weiAmount.toString());
    const bn_tokenAmount = parsedData.tokenAmount;
    const bn_ethAmount = bn_weiAmount.div(ONE_ETH_IN_WEI);

    const ethAmount = bn_ethAmount.toString();
    const ethAmountRounded = parseFloat(bn_ethAmount.toFixed(6));
    const tokenAmount = parseFloat(bn_tokenAmount / DECIMALS_DIV);
    const price = parseFloat(parsedData.price / PPM_DIV);
    const publishedRate = parsedData.publishedRate && parseFloat(parsedData.publishedRate / DECIMALS_DIV);
    let direction = tokenAmount === 0 ? "buy" : "sell";
    if (event.name === "OrderFill") {
        direction = type;
    }

    const logData = Object.assign({ args: parsedData }, eventLog, {
        blockData,
        direction,
        blockTimeStampText: blockTimeStampText,
        bn_weiAmount: bn_weiAmount,
        bn_tokenAmount: bn_tokenAmount,
        tokenAmount: tokenAmount ? tokenAmount : "",
        ethAmount: ethAmount,
        ethAmountRounded: ethAmountRounded ? ethAmountRounded : "",
        price: price ? price : "",
        pricePt: price ? floatNumberConverter(price, DECIMALS) + "%" : "",
        publishedRate,
        type: event.name
    });

    console.log("LOGDATA: ", logData);

    return logData;
}
