import React from "react";
import { Pblock } from "components/PageLayout";
import { NoOrdersToolTip } from "./ExchangeToolTips";
import { ConnectionStatus } from "components/MsgPanels";

export default class ExchangeSummary extends React.Component {
    render() {
        const { rates, exchange, ...other } = this.props;
        return (
            <Pblock loading={rates.isLoading} {...other}>
                <ConnectionStatus contract={rates} />

                {rates.isLoaded ? <h4>1 ETH = {rates.info.ethFiatRate} A-EUR</h4> : <h5>Loading ETH/EUR rates...</h5>}

                <ConnectionStatus contract={exchange} />

                {exchange.isLoaded && !exchange.isLoading ? (
                    exchange.info.buyOrderCount + exchange.info.sellOrderCount > 0 ? (
                        <h4>
                            {exchange.info.buyOrderCount} buy A-EUR | {exchange.info.sellOrderCount} sell A-EUR
                        </h4>
                    ) : (
                        <h4>
                            No open orders. Place one. <NoOrdersToolTip />
                        </h4>
                    )
                ) : (
                    <h5>Loading orders...</h5>
                )}
            </Pblock>
        );
    }
}

ExchangeSummary.defaultProps = {
    header: "Exchange summary"
};
