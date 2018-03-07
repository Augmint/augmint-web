import React from "react";

import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";

export default class TradeBook extends React.Component {
    render() {
        const { header, userAccountAddress } = this.props;
        const { trades, refreshError, isLoading } = this.props.exchange;

        return (
            <Pblock loading={isLoading} header={header}>
                {refreshError && (
                    <ErrorPanel header="Error while fetching order list">{refreshError.message}</ErrorPanel>
                )}
                {trades == null && !isLoading && <p>Connecting...</p>}
                {isLoading ? (
                    <p>Refreshing orders...</p>
                ) : (
                    <div>
                      {trades && trades.map(trade => (
                        <div key={trade.type + trade.blockData.timestamp}>
                          <span>{trade.blockTimeStampText}--</span>
                          <span>{trade.type}--</span>
                          <span>{trade.directionText}</span>
                          {trade.ethAmountRounded && <span>--{trade.ethAmountRounded} eth</span>}
                          {trade.tokenAmount && <span>--{trade.tokenAmount} A€</span>}
                        </div>
                      ))}
                    </div>
                )}
            </Pblock>
        );
    }
}
