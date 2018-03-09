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
                    <ErrorPanel header="Error while fetching trade list">{error.message}</ErrorPanel>
                )}
                {trades == null && !isLoading && <p>Connecting...</p>}
                {isLoading ? (
                    <p>Refreshing orders...</p>
                ) : (
                    <div>
                      {trades && trades.map((trade, index) => (
                        <div key={trade.type + '_' +trade.blockData.timestamp + '_' + index}>
                          {/* <h1>{trade.blockNumber}</h1>
                          <h1>{trade.blockData.timestamp}</h1> */}
                          <span>Date: {trade.blockTimeStampText}--</span>
                          <span>Type: {trade.type}--</span>
                          <span>Direction: {trade.direction}--</span>
                          <span>Price: {trade.price}</span>
                          <span>TokenValue: {trade.tokenValue}</span>
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
