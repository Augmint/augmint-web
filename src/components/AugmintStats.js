import React from "react";
import { Link } from "react-router-dom";
import { Statistic, Segment, Button } from "semantic-ui-react";
import { ConnectionStatus } from "components/MsgPanels";

export class AugmintStats extends React.Component {
    render() {
        const { showDetailsLink, augmintToken, monetarySupervisor, size, showDetails } = this.props;
        const { ethFiatRate } = this.props.rates.info;
        const { isConnected, isLoading, connectionError } = this.props.augmintToken;
        const { totalSupply, feeAccountTokenBalance, decimals } = augmintToken.info;

        const {
            reserveTokenBalance,
            issuedByMonetaryBoard,
            reserveEthBalance,
            interestEarnedAccountTokenBalance
        } = monetarySupervisor.info;

        const reserveEthBalanceInFiat =
            ethFiatRate == null || reserveEthBalance == null
                ? "?"
                : (ethFiatRate * reserveEthBalance).toFixed(decimals);

        return (
            <Segment vertical textAlign="center" loading={isLoading || (!isConnected && !connectionError)}>
                <ConnectionStatus contract={augmintToken} />

                <Statistic.Group widths="3" size={size}>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>Total supply</Statistic.Label>
                        <Statistic.Value testid="totalSupply">{totalSupply} A-EUR</Statistic.Value>
                        {showDetails && (
                            <p testid="issuedByMonetaryBoard" style={{ textAlign: "center" }}>
                                {issuedByMonetaryBoard} A-EUR issued by Monetary Board
                            </p>
                        )}
                    </Statistic>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>ETH reserve</Statistic.Label>
                        <Statistic.Value testid="reserveEthBalance">{reserveEthBalance} ETH</Statistic.Value>
                        {showDetails && (
                            <p testid="reserveEthBalanceInFiat" style={{ textAlign: "center" }}>
                                ({reserveEthBalanceInFiat} EUR)
                            </p>
                        )}
                    </Statistic>

                    <Statistic testid="reserveTokenBalance" style={{ padding: "1em" }}>
                        <Statistic.Label>A-EUR reserve</Statistic.Label>
                        <Statistic.Value>{reserveTokenBalance} A-EUR</Statistic.Value>
                    </Statistic>

                    <Statistic testid="feeAccountTokenBalance" style={{ padding: "1em" }}>
                        <Statistic.Label>A-EUR fee account</Statistic.Label>
                        <Statistic.Value>{feeAccountTokenBalance} A-EUR</Statistic.Value>
                    </Statistic>

                    <Statistic testid="interestEarnedAccountTokenBalance" style={{ padding: "1em" }}>
                        <Statistic.Label>A-EUR earned interest account</Statistic.Label>
                        <Statistic.Value>{interestEarnedAccountTokenBalance} A-EUR</Statistic.Value>
                    </Statistic>
                </Statistic.Group>

                {showDetailsLink && (
                    <Button
                        content="Reserve details"
                        as={Link}
                        to="/reserves"
                        icon="right chevron"
                        labelPosition="right"
                        basic
                    />
                )}
            </Segment>
        );
    }
}

AugmintStats.defaultProps = {
    showDetailsLink: false,
    size: "tiny",
    showInFiat: false
};
