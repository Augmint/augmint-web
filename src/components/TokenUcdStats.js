import React from "react";
import { Link } from "react-router-dom";
import { Statistic, Container } from "semantic-ui-react";

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
        const { isConnected, isLoading } = this.props.tokenUcd;

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
            <div>
                {!isConnected && <p>Connecting to tokenUcd contract...</p>}

                {isLoading && <p>Refreshing tokenUcd info...</p>}

                <Statistic.Group widths="3" size={size}>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>Total supply</Statistic.Label>
                        <Statistic.Value>{totalSupply} UCD</Statistic.Value>
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
                        <Statistic.Label>UCD reserve</Statistic.Label>
                        <Statistic.Value>{ucdBalance} UCD</Statistic.Value>
                    </Statistic>
                </Statistic.Group>
                <Container>
                    {showTokenUcdLink && (
                        <Link to="/tokenUcd">More details</Link>
                    )}
                </Container>
            </div>
        );
    }
}

TokenUcdStats.defaultProps = {
    showTokenUcdLink: false,
    size: "tiny",
    showInUsd: false
};
