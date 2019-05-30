import store from "modules/store";
import { Ratio, Wei, Tokens } from "@augmint/js";

export async function fetchTradesTx(account, fromBlock, toBlock) {
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
        return log2.timestamp - log1.timestamp;
    });

    return logs;
}

export async function formatTradeEvent(account, event, type) {
    const web3 = store.getState().web3Connect.web3Instance;
    const blockData = await web3.eth.getBlock(event.blockNumber); // CHECK: block used to be available on Infura later than than tx receipt (Infura node syncing delay). Can't reproduce anymore but requires further tests

    const timestamp = blockData && (await blockData.timestamp);

    const e = event.returnValues;

    const weiAmount = Wei.parse(e.weiAmount).zeroToNull();
    const tokenAmount = Tokens.parse(e.tokenAmount).zeroToNull();
    const price = e.price && Ratio.parse(e.price).zeroToNull();
    const publishedRate = e.publishedRate && Tokens.parse(e.publishedRate).zeroToNull();

    const effectiveRate = publishedRate && publishedRate.mul(price);

    const orderId = (e.orderId ? e.orderId : weiAmount ? e.buyTokenOrderId : e.sellTokenOrderId) * 1;

    const direction = event.name === "OrderFill" ? type : weiAmount ? "buy" : "sell";

    const trade = Object.assign({}, event, {
        timestamp,
        direction,
        weiAmount,
        tokenAmount,
        price,
        publishedRate,
        effectiveRate,
        orderId,
        type: event.event
    });

    return trade;
}
