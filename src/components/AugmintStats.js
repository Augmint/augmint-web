import React from "react";
import { Link } from "react-router-dom";
import { Statistic, Segment, Button } from "semantic-ui-react";
import { ConnectionStatus } from "components/MsgPanels";

export class AugmintStats extends React.Component {
    render() {
        const { showDetailsLink, augmintToken, rates, size, showInFiat } = this.props;

        const bn_ethFiatRate = showInFiat ? rates.info.bn_ethFiatRate : null;
        const { isConnected, isLoading, connectionError } = this.props.augmintToken;

        const {
            totalSupply,
            tokenBalance,
            feeAccountAceBalance,
            interestEarnedAccountAceBalance,
            ethBalance,
            bn_ethBalance
        } = augmintToken.info;

        const ethBalanceInFiat =
            bn_ethFiatRate == null || bn_ethBalance == null ? "?" : bn_ethFiatRate.mul(bn_ethBalance).toString();

        return (
            <Segment vertical textAlign="center" loading={isLoading || (!isConnected && !connectionError)}>
                <ConnectionStatus contract={augmintToken} />

                <Statistic.Group widths="3" size={size}>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>Total supply</Statistic.Label>
                        <Statistic.Value>{totalSupply} A-EUR</Statistic.Value>
                    </Statistic>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>ETH reserve</Statistic.Label>
                        <Statistic.Value>{ethBalance} ETH</Statistic.Value>
                        {showInFiat && <p style={{ textAlign: "center" }}>({ethBalanceInFiat} EUR)</p>}
                    </Statistic>

                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>A-EUR reserve</Statistic.Label>
                        <Statistic.Value>{tokenBalance} A-EUR</Statistic.Value>
                    </Statistic>

                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>A-EUR fee account</Statistic.Label>
                        <Statistic.Value>{feeAccountAceBalance} A-EUR</Statistic.Value>
                    </Statistic>

                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>A-EUR earned interest account</Statistic.Label>
                        <Statistic.Value>{interestEarnedAccountAceBalance} A-EUR</Statistic.Value>
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
