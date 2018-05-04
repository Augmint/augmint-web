import React from "react";

import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import { CustomTable } from "components/Table";

export default class TradeHistory extends React.Component {
    render() {
        const { header } = this.props;
        const { trades, error, isLoading } = this.props.trades;
        const dataKeys = [
            "blockTimeStampText",
            "type",
            "direction",
            "pricePt",
            "tokenValue",
            "ethAmountRounded",
            "tokenAmount"
        ];
        const unit = ["", "", "", "", "A€", "ETH", "A€"];
        const headerData = {
            blockTimeStampText: "Date",
            type: "Type",
            direction: "Direction",
            pricePt: "Price",
            ethAmountRounded: "Eth Amount",
            tokenAmount: "Token Amount"
        };

        return (
            <Pblock loading={isLoading} header={header}>
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
