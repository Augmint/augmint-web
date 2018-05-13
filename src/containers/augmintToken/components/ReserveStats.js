import React from "react";
import { Statistic, Segment } from "semantic-ui-react";
import { ConnectionStatus } from "components/MsgPanels";

export class ReserveStats extends React.Component {
    render() {
        const { augmintToken, monetarySupervisor, size, showDetails } = this.props;
        const { ethFiatRate } = this.props.rates.info;
        const { isLoaded, isLoading, loadError } = this.props.augmintToken;
        const { decimals } = augmintToken.info;

        const { reserveTokenBalance, reserveEthBalance } = monetarySupervisor.info;

        const reserveEthBalanceInFiat =
            ethFiatRate === "?" || reserveEthBalance === "?"
                ? "?"
                : parseFloat((ethFiatRate * reserveEthBalance).toFixed(decimals));

        return (
            <Segment vertical textAlign="center" loading={isLoading || (!isLoaded && !loadError)}>
                <ConnectionStatus contract={augmintToken} />

                <Statistic.Group widths="2" size={size}>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>ETH reserve</Statistic.Label>
                        <Statistic.Value data-testid="reserveEthBalance">{reserveEthBalance} ETH</Statistic.Value>
                        {showDetails && (
                            <p data-testid="reserveEthBalanceInFiat" style={{ textAlign: "center" }}>
                                ({reserveEthBalanceInFiat} EUR)
                            </p>
                        )}
                    </Statistic>

                    <Statistic data-testid="reserveTokenBalance" style={{ padding: "1em" }}>
                        <Statistic.Label>A-EUR reserve</Statistic.Label>
                        <Statistic.Value>{reserveTokenBalance} A-EUR</Statistic.Value>
                    </Statistic>
                </Statistic.Group>
            </Segment>
        );
    }
}

ReserveStats.defaultProps = {
    size: "small",
    showInFiat: true,
    showDetails: true
};
