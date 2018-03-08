import store from "modules/store";
import ethers from "ethers";
import moment from "moment";

export async function fetchTradesTx(account, fromBlock, toBlock) {
    try {
        const exchangeInstance = store.getState().exchange.contract.ethersInstance;
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

        const logs = await Promise.all([
            ...logsNewOrder.map(eventLog => _formatTradeLog(NewOrder, account, eventLog)),
            ...logsCanceledOrder.map(eventLog => _formatTradeLog(CancelledOrder, account, eventLog)),
            ...logsOrderFillBuy.map(eventLog => _formatTradeLog(OrderFill, account, eventLog)),
            ...logsOrderFillSell.map(eventLog => _formatTradeLog(OrderFill, account, eventLog))
        ]);

        // const logs = [...formattedLogsNewOrder, ...formattedLogsCanceledOrder, ...formattedLogsOrderFillBuy, ...formattedLogsOrderFillSell];

        console.log(logs);

        logs.sort((log1, log2) => {
          console.log('log1',log1, 'log2', log2);
          return log2.blockData.timestamp - log1.blockData.timestamp;
        });

        return logs;
    } catch (error) {
        throw new Error("fetchTransferList failed.\n" + error);
    }
}

async function _formatTradeLog(event, account, eventLog) {
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;
    let blockData;
    if (typeof eventLog.getBlock === "function") {
        // called from event - need to use this.getBlock b/c block is available on Infura later than than tx receipt (Infura  node syncing)
        blockData = await eventLog.getBlock();
    } else {
        // not from event, provider.getBlock should work
        const provider = store.getState().web3Connect.ethers.provider;
        blockData = await provider.getBlock(eventLog.blockNumber);
    }

    const parsedData = event.parse(eventLog.topics, eventLog.data);
    const blockTimeStampText = blockData ? moment.unix(await blockData.timestamp).format("D MMM YYYY HH:mm") : "?";

    const bn_weiAmount = parsedData.weiAmount;
    const bn_tokenAmount = parsedData.tokenAmount;
    const bn_ethAmount  = + store.getState().web3Connect.web3Instance.utils.fromWei(bn_weiAmount._bn, 'ether');
    const ethAmount  = bn_ethAmount.toString();
    const ethAmountRounded = parseFloat(bn_ethAmount.toFixed(6));
    const tokenAmount = parseFloat(bn_tokenAmount / decimalsDiv);
    const price = parseFloat(parsedData.price / decimalsDiv);

    const logData = Object.assign({ args: parsedData }, eventLog, {
        blockData,
        blockTimeStampText: blockTimeStampText,
        bn_weiAmount: bn_weiAmount,
        bn_tokenAmount: bn_tokenAmount,
        tokenAmount: tokenAmount,
        ethAmount: ethAmount,
        ethAmountRounded: ethAmountRounded,
        price: price ,
        type: event.name
    });

    return logData;
}
