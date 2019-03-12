import React from "react";

import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import { CustomTable } from "components/Table";

import { ETHEUR } from "utils/constants";

export default class TradeHistory extends React.Component {
    render() {
        const { header } = this.props;
        const { trades, error, isLoading } = this.props.trades;
        const dataKeys = [
            "orderId",
            "blockTimeStampText",
            "type",
            "direction",
            "pricePt",
            "ethAmountRounded",
            "tokenAmount",
            "effectiveRate"
        ];
        const unit = ["", "", "", "", "", "ETH", "A€", "A€", ""];
        const headerData = {
            orderId: "ID",
            blockTimeStampText: "Date",
            type: "Type",
            direction: "Direction",
            pricePt: "Price",
            ethAmountRounded: "Eth Amount",
            tokenAmount: "A€ Amount",
            effectiveRate: ETHEUR + " RATE"
        };

        return (
            <Pblock loading={isLoading} header={header} style={{ overflow: "auto" }}>
                {error && <ErrorPanel header="Error while fetching trade list">{error.message}</ErrorPanel>}
                {trades == null && !isLoading && <p>Connecting...</p>}
                {!error && isLoading && <p>Refreshing orders...</p>}
                {!error && trades && !isLoading && (
                    <CustomTable
                        datakeys={dataKeys}
                        unit={unit}
                        data={trades}
                        headerdata={headerData}
                        testid="trade-history"
                        noItemsMessage="You have no trades yet"
                    />
                )}
            </Pblock>
        );
    }
}
