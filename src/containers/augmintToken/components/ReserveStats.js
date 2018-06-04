import React from "react";
import { ConnectionStatus } from "components/MsgPanels";
import Segment from "components/augmint-ui/segment";
import Statistic from "components/augmint-ui/statistic";

export class ReserveStats extends React.Component {
    render() {
        const { augmintToken, monetarySupervisor, showDetails } = this.props;
        const { ethFiatRate } = this.props.rates.info;
        const { isLoaded, isLoading, loadError } = this.props.augmintToken;
        const { decimals } = augmintToken.info;

        const { reserveTokenBalance, reserveEthBalance } = monetarySupervisor.info;

        const reserveEthBalanceInFiat =
            ethFiatRate === "?" || reserveEthBalance === "?"
                ? "?"
                : parseFloat((ethFiatRate * reserveEthBalance).toFixed(decimals));

        return (
            <Segment className="vertical" loading={isLoading || (!isLoaded && !loadError)}>
                <ConnectionStatus contract={augmintToken} />

                <Statistic.Group>
                    <Statistic
                        data-testid="reserveEthBalance"
                        style={{ padding: "1em" }}
                        label="ETH reserve"
                        value={reserveEthBalance + " ETH"}
                    >
                        {showDetails && (
                            <p data-testid="reserveEthBalanceInFiat" style={{ textAlign: "center" }}>
                                ({reserveEthBalanceInFiat} EUR)
                            </p>
                        )}
                    </Statistic>

                    <Statistic
                        data-testid="reserveTokenBalance"
                        style={{ padding: "1em" }}
                        label="A-EUR reserve"
                        value={reserveTokenBalance + " A-EUR"}
                    />
                </Statistic.Group>
            </Segment>
        );
    }
}

ReserveStats.defaultProps = {
    showInFiat: true,
    showDetails: true
};
