import React from "react";

import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";

export default class TradeBook extends React.Component {
    render() {
        const { header, userAccountAddress } = this.props;
        const { trades, error, isLoading } = this.props.trades;

        return (
            <Pblock loading={isLoading} header={header}>
                {error && (
                    <ErrorPanel header="Error while fetching order list">{error.message}</ErrorPanel>
                )}
                {trades == null && !isLoading && <p>Connecting...</p>}
                {isLoading ? (
                    <p>Refreshing orders...</p>
                ) : (
                    <div>
                      {trades && trades.map(trade => (
                        <div key={trade.type + trade.blockData.timestamp}>
                          <span>Date: {trade.blockTimeStampText}--</span>
                          <span>Type: {trade.type}--</span>
                          <span>Direction: {trade.directionText}--</span>
                          <span>Price: {trade.price}</span>
                          {trade.ethAmount && <span>--Eth Amount: {trade.ethAmountRounded} eth</span>}
                          {trade.tokenAmount && <span>--Token Amount: {trade.tokenAmount} A€</span>}
                        </div>
                      ))}
                    </div>
                )}
            </Pblock>
        );
    }
}
