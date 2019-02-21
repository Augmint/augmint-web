import React from "react";

import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import { CustomTable } from "components/Table";

import { DECIMALS } from "utils/constants";
import { floatNumberConverter } from "utils/converter";

export default class TradeHistory extends React.Component {
    render() {
        const { header } = this.props;
        const { trades, error, isLoading } = this.props.trades;
        // console.log("trades: ", trades);
        // console.log("this props trades: ", this.props.trades.trades);
        // const modTrades = trades && trades.map((trade, tradeIndex) => {
        //     console.log("key: ", trade);
        //     trade.pricePt = (floatNumberConverter(trade.price, DECIMALS)).toFixed(2);
        //     // console.log("trade.pricePt: ", trade.pricePt);
        //     console.log("trade.pricePt: ", trade.pricePt);
        // });
        const dataKeys = [
            "orderId",
            "blockTimeStampText",
            "type",
            "direction",
            "pricePt",
            "ethAmountRounded",
            "tokenAmount",
            "publishedRate"
        ];
        const unit = ["", "", "", "", "", "ETH", "A€", "A€"];
        const headerData = {
            orderId: "Order ID",
            blockTimeStampText: "Date",
            type: "Type",
            direction: "Direction",
            pricePt: "Price",
            ethAmountRounded: "Eth Amount",
            tokenAmount: "Token Amount",
            publishedRate: "ETH/€ rate"
        };

        return (
            <Pblock loading={isLoading} header={header} style={{ overflow: "auto" }}>
                {error && <ErrorPanel header="Error while fetching trade list">{error.message}</ErrorPanel>}
                {trades == null && !isLoading && <p>Connecting...</p>}
                {!error && isLoading ? (
                    <p data-testid="TradeHistoryRefreshing">Refreshing orders...</p>
                ) : (
                    <CustomTable
                        datakeys={dataKeys}
                        unit={unit}
                        data={trades}
                        headerdata={headerData}
                        testid="trade-history"
                    />
                )}
            </Pblock>
        );
    }
}
