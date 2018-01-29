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

                <h4>
                    1 ETH = {rates.info.ethFiatRate} <nobr>A-EUR</nobr><br />
                    1 <nobr>A-EUR</nobr> = {rates.info.fiatEthRate} ETH
                </h4>

                {exchange.isConnected &&
                !exchange.isLoading &&
                exchange.info.buyOrderCount + exchange.info.sellOrderCount > 0 ? (
                    <h4>
                        {exchange.info.buyOrderCount} buy <nobr>A-EUR</nobr> | {exchange.info.sellOrderCount} sell <nobr>A-EUR</nobr>
                    </h4>
                ) : (
                    <h4>
                        No open orders. Place one. <NoOrdersToolTip />
                    </h4>
                )}
            </Pblock>
        );
    }
}

ExchangeSummary.defaultProps = {
    header: "Exchange summary"
};
