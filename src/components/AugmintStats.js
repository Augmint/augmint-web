import React from "react";
import { Link } from "react-router-dom";
import { Statistic, Segment, Button } from "semantic-ui-react";
import { ConnectionStatus } from "components/MsgPanels";

export class AugmintStats extends React.Component {
    render() {
        const { showDetailsLink, augmintToken, monetarySupervisor, rates, size, showDetails } = this.props;

        const bn_ethFiatRate = showDetails ? rates.info.bn_ethFiatRate : null;
        const { isConnected, isLoading, connectionError } = this.props.augmintToken;

        const { totalSupply, feeAccountTokenBalance } = augmintToken.info;

        const {
            reserveTokenBalance,
            issuedByMonetaryBoard,
            bn_reserveEthBalance,
            reserveEthBalance,
            interestEarnedAccountTokenBalance
        } = monetarySupervisor.info;

        const reserveEthBalanceInFiat =
            bn_ethFiatRate == null || bn_reserveEthBalance == null
                ? "?"
                : bn_ethFiatRate.mul(bn_reserveEthBalance).toString();

        return (
            <Segment vertical textAlign="center" loading={isLoading || (!isConnected && !connectionError)}>
                <ConnectionStatus contract={augmintToken} />

                <Statistic.Group widths="3" size={size}>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>Total supply</Statistic.Label>
                        <Statistic.Value testId="totalSupply">{totalSupply} A-EUR</Statistic.Value>
                        {showDetails && (
                            <p testId="issuedByMonetaryBoard" style={{ textAlign: "center" }}>
                                {issuedByMonetaryBoard} A-EUR issued by Monetary Board
                            </p>
                        )}
                    </Statistic>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>ETH reserve</Statistic.Label>
                        <Statistic.Value testId="reserveEthBalance">{reserveEthBalance} ETH</Statistic.Value>
                        {showDetails && (
                            <p testId="reserveEthBalanceInFiat" style={{ textAlign: "center" }}>
                                ({reserveEthBalanceInFiat} EUR)
                            </p>
                        )}
                    </Statistic>

                    <Statistic testId="reserveTokenBalance" style={{ padding: "1em" }}>
                        <Statistic.Label>A-EUR reserve</Statistic.Label>
                        <Statistic.Value>{reserveTokenBalance} A-EUR</Statistic.Value>
                    </Statistic>

                    <Statistic testId="feeAccountTokenBalance" style={{ padding: "1em" }}>
                        <Statistic.Label>A-EUR fee account</Statistic.Label>
                        <Statistic.Value>{feeAccountTokenBalance} A-EUR</Statistic.Value>
                    </Statistic>

                    <Statistic testId="interestEarnedAccountTokenBalance" style={{ padding: "1em" }}>
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
