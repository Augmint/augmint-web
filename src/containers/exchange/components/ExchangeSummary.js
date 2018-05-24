import React from "react";
import { Pblock } from "components/PageLayout";
import { NoOrdersToolTip } from "./ExchangeToolTips";
import { ConnectionStatus } from "components/MsgPanels";

export default class ExchangeSummary extends React.Component {
    render() {
        const { rates, exchange, ...other } = this.props;
        return (
            <Pblock
                loading={rates.isLoading || exchange.isLoading || (!exchange.isConnected && !exchange.connectionError)}
                {...other}
            >
                <ConnectionStatus contract={rates} />

                <p>
                    1 ETH = {rates.info.ethFiatRate} A-EUR<br />
                    1 A-EUR = {rates.info.fiatEthRate} ETH
                </p>

                {exchange.isConnected &&
                !exchange.isLoading &&
                exchange.info.buyOrderCount + exchange.info.sellOrderCount > 0 ? (
                    <p>
                        {exchange.info.buyOrderCount} buy A-EUR | {exchange.info.sellOrderCount} sell A-EUR
                    </p>
                ) : (
                    <p>
                        No open orders. Place one. <NoOrdersToolTip />
                    </p>
                )}
            </Pblock>
        );
    }
}

ExchangeSummary.defaultProps = {
    header: "Exchange summary"
};
