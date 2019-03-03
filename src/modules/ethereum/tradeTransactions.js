import store from "modules/store";
import moment from "moment";
import BigNumber from "bignumber.js";
import { ONE_ETH_IN_WEI, DECIMALS_DIV, PPM_DIV, DECIMALS } from "utils/constants";
import { floatNumberConverter } from "utils/converter";

export async function fetchTradesTx(account, fromBlock, toBlock) {
    try {
        const exchange = store.getState().contracts.latest.exchange.web3ContractInstance;

        const [logsNewOrder, logsOrderFillBuy, logsOrderFillSell, logsCanceledOrder] = await Promise.all([
            exchange.getPastEvents("NewOrder", { filter: { maker: account }, fromBlock, toBlock }),
            exchange.getPastEvents("OrderFill", { filter: { tokenBuyer: account }, fromBlock, toBlock }),
            exchange.getPastEvents("OrderFill", { filter: { tokenSeller: account }, fromBlock, toBlock }),
            exchange.getPastEvents("CancelledOrder", { filter: { maker: account }, fromBlock, toBlock })
        ]);

        const logs = await Promise.all([
            ...logsNewOrder.map(async logData => _formatTradeLog(account, logData, logData.returnValues)),
            ...logsCanceledOrder.map(async logData => _formatTradeLog(account, logData, logData.returnValues)),
            ...logsOrderFillBuy.map(async logData => _formatTradeLog(account, logData, logData.returnValues, "buy")),
            ...logsOrderFillSell.map(async logData => _formatTradeLog(account, logData, logData.returnValues, "sell"))
        ]);

        logs.sort((log1, log2) => {
            return log2.blockData.timestamp - log1.blockData.timestamp;
        });

        return logs;
    } catch (error) {
        throw new Error("fetchTradesTx failed.\n" + error);
    }
}

// called from exchangeProvider, arguments are in ethers event listener format
export async function processNewTradeTx(account, eventObject, type) {
    return _formatTradeLog(account, eventObject, eventObject.args, type);
}

// get txData in format of logData returned from web3.getPastEvents or with eventObject passed by ethers event listener
async function _formatTradeLog(account, txData, args, type) {
    let blockData;
    if (typeof txData.getBlock === "function") {
        // called from event - need to use eventObject.getBlock b/c block is available on Infura later than than tx receipt (Infura  node syncing)
        blockData = await txData.getBlock();
    } else {
        // not from event, web3.getBlock  works
        const web3 = store.getState().web3Connect.web3Instance;
        blockData = await web3.eth.getBlock(txData.blockNumber);
    }

    const blockTimeStampText = blockData ? moment.unix(await blockData.timestamp).format("D MMM YYYY HH:mm") : "?";

    const bn_weiAmount = new BigNumber(args.weiAmount.toString());
    const bn_tokenAmount = args.tokenAmount;
    const bn_ethAmount = bn_weiAmount.div(ONE_ETH_IN_WEI);

    const ethAmount = bn_ethAmount.toString();
    const ethAmountRounded = parseFloat(bn_ethAmount).toFixed(5);
    const tokenAmount = parseFloat(bn_tokenAmount / DECIMALS_DIV);
    const price = parseFloat(args.price / PPM_DIV);
    const publishedRate = args.publishedRate && parseFloat(args.publishedRate / DECIMALS_DIV).toFixed(2);

    let orderId;
    if (args.orderId) {
        orderId = args.orderId;
    } else {
        orderId = tokenAmount === 0 ? args.buyTokenOrderId : args.sellTokenOrderId;
    }
    if (typeof orderId.toNumber === "function") {
        // event listener from ethers returns BigNumber
        orderId = orderId.toNumber();
    }

    let direction = tokenAmount === 0 ? "buy" : "sell";
    if (txData.event === "OrderFill") {
        direction = type;
    }

    const logData = Object.assign({ args }, txData, {
        blockData,
        direction,
        blockTimeStampText,
        bn_weiAmount,
        bn_tokenAmount,
        tokenAmount: tokenAmount ? tokenAmount.toFixed(2) : "",
        ethAmount,
        ethAmountRounded: ethAmount !== "0" ? ethAmountRounded : "",
        price: price ? price : "",
        pricePt: price ? floatNumberConverter(price, DECIMALS).toFixed(2) + "%" : "",
        publishedRate,
        orderId,
        type: txData.event
    });

    return logData;
}
