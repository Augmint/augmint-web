import React from "react";
import { Pblock } from "components/PageLayout";
import { NoOrdersToolTip } from "./ExchangeToolTips";
import { ConnectionStatus } from "components/MsgPanels";
import { ETHEUR } from "utils/constants";

export default class ExchangeSummary extends React.Component {
    render() {
        const { rates, exchange, ...other } = this.props;
        return (
            <Pblock loading={rates.isLoading} {...other}>
                <ConnectionStatus contract={rates} />

                {rates.isLoaded ? <p>1 ETH = {rates.info.ethFiatRate} A-EUR</p> : <h5>Loading {ETHEUR} rates...</h5>}

                <ConnectionStatus contract={exchange} />

                {exchange.isLoaded && !exchange.isLoading ? (
                    exchange.info.buyOrderCount + exchange.info.sellOrderCount > 0 ? (
                        <p>
                            {exchange.info.buyOrderCount} buy A-EUR | {exchange.info.sellOrderCount} sell A-EUR
                        </p>
                    ) : (
                        <p>
                            No open orders. Place one. <NoOrdersToolTip />
                        </p>
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
