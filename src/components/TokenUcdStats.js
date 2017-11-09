import React from "react";
import { Link } from "react-router-dom";
import { Statistic, Segment, Button } from "semantic-ui-react";
import { ConnectionStatus } from "components/MsgPanels";

export class TokenUcdStats extends React.Component {
    render() {
        const {
            showTokenUcdLink,
            tokenUcd,
            rates,
            size,
            showInUsd
        } = this.props;

        const bn_ethUsdRate = showInUsd ? rates.info.bn_ethUsdRate : null;
        const { isConnected, isLoading, connectionError } = this.props.tokenUcd;

        const {
            totalSupply,
            ucdBalance,
            ethBalance,
            bn_ethBalance
        } = tokenUcd.info;

        const ethBalanceInUsd =
            bn_ethUsdRate == null || bn_ethBalance == null
                ? "?"
                : bn_ethUsdRate.mul(bn_ethBalance).toString();

        return (
            <Segment
                vertical
                textAlign="center"
                loading={isLoading || (!isConnected && !connectionError)}
            >
                <ConnectionStatus contract={tokenUcd} />

                <Statistic.Group widths="3" size={size}>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>Total supply</Statistic.Label>
                        <Statistic.Value>{totalSupply} ACD</Statistic.Value>
                    </Statistic>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>ETH reserve</Statistic.Label>
                        <Statistic.Value>{ethBalance} ETH</Statistic.Value>
                        {showInUsd && (
                            <p style={{ textAlign: "center" }}>
                                ({ethBalanceInUsd} USD)
                            </p>
                        )}
                    </Statistic>

                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>ACD reserve</Statistic.Label>
                        <Statistic.Value>{ucdBalance} ACD</Statistic.Value>
                    </Statistic>
                </Statistic.Group>

                {showTokenUcdLink && (
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

TokenUcdStats.defaultProps = {
    showTokenUcdLink: false,
    size: "tiny",
    showInUsd: false
};
