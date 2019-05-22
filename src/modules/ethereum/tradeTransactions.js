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
            ...logsNewOrder.map(async logData => formatTradeEvent(account, logData)),
            ...logsCanceledOrder.map(async logData => formatTradeEvent(account, logData)),
            ...logsOrderFillBuy.map(async logData => formatTradeEvent(account, logData, "buy")),
            ...logsOrderFillSell.map(async logData => formatTradeEvent(account, logData, "sell"))
        ]);

        logs.sort((log1, log2) => {
            return log2.blockData.timestamp - log1.blockData.timestamp;
        });

        return logs;
    } catch (error) {
        throw new Error("fetchTradesTx failed.\n" + error);
    }
}
export async function formatTradeEvent(account, event, type) {
    const web3 = store.getState().web3Connect.web3Instance;
    const blockData = await web3.eth.getBlock(event.blockNumber); // CHECK: block used to be available on Infura later than than tx receipt (Infura node syncing delay). Can't reproduce anymore but requires further tests

    const blockTimeStampText = blockData ? moment.unix(await blockData.timestamp).format("D MMM YYYY HH:mm") : "?";

    const bn_weiAmount = new BigNumber(event.returnValues.weiAmount.toString());
    const bn_tokenAmount = event.returnValues.tokenAmount;
    const bn_ethAmount = bn_weiAmount.div(ONE_ETH_IN_WEI);

    const ethAmount = bn_ethAmount.toString();
    const ethAmountRounded = parseFloat(bn_ethAmount).toFixed(5);
    const tokenAmount = parseFloat(bn_tokenAmount / DECIMALS_DIV);
    const price = parseFloat(event.returnValues.price / PPM_DIV);
    const publishedRate =
        event.returnValues.publishedRate && parseFloat(event.returnValues.publishedRate / DECIMALS_DIV).toFixed(2);
    const effectiveRate =
        event.returnValues.publishedRate &&
        parseFloat((event.returnValues.publishedRate / DECIMALS_DIV) * price).toFixed(2);

    let orderId;
    if (event.returnValues.orderId) {
        orderId = event.returnValues.orderId * 1;
    } else {
        orderId = tokenAmount === 0 ? event.returnValues.buyTokenOrderId * 1 : event.returnValues.sellTokenOrderId * 1;
    }

    let direction = tokenAmount === 0 ? "buy" : "sell";
    if (event.name === "OrderFill") {
        direction = type;
    }

    const trade = Object.assign({}, event, {
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
        effectiveRate,
        orderId,
        type: event.event
    });

    return trade;
}
