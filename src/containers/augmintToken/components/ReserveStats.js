import React from "react";
import { ConnectionStatus } from "components/MsgPanels";
import Segment from "components/augmint-ui/segment";
import Statistic from "components/augmint-ui/statistic";
import { Pgrid } from "components/PageLayout";

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
            <Segment className="vertical" loading={isLoading || (!isLoaded && !loadError)} style={{ padding: 0 }}>
                <ConnectionStatus contract={augmintToken} />

                <Pgrid>
                    <Pgrid.Row halign="justify">
                        <Pgrid.Column size={{ tablet: 1, desktop: 1 / 2 }}>
                            <Statistic
                                data-testid="reserveEthBalance"
                                label="ETH reserve"
                                value={(reserveEthBalance > 0 ? Number(reserveEthBalance).toFixed(4) : 0) + " ETH"}
                            >
                                {showDetails && (
                                    <p data-testid="reserveEthBalanceInFiat" style={{ textAlign: "center" }}>
                                        ({reserveEthBalanceInFiat} EUR)
                                    </p>
                                )}
                            </Statistic>
                        </Pgrid.Column>
                        <Pgrid.Column size={{ tablet: 1, desktop: 1 / 2 }}>
                            <Statistic
                                data-testid="reserveTokenBalance"
                                label="A-EUR reserve"
                                value={reserveTokenBalance + " A€"}
                            />
                        </Pgrid.Column>
                    </Pgrid.Row>
                </Pgrid>
            </Segment>
        );
    }
}

ReserveStats.defaultProps = {
    showInFiat: true,
    showDetails: true
};
