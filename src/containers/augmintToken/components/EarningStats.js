import React from "react";
import { Statistic, Segment } from "semantic-ui-react";
import { ConnectionStatus } from "components/MsgPanels";

export class EarningStats extends React.Component {
    render() {
        const { augmintToken, monetarySupervisor, size } = this.props;

        const { isLoaded, isLoading, loadError } = this.props.augmintToken;
        const { feeAccountTokenBalance, feeAccountEthBalance } = augmintToken.info;

        const { interestEarnedAccountTokenBalance } = monetarySupervisor.info;

        return (
            <Segment vertical textAlign="center" loading={isLoading || (!isLoaded && !loadError)}>
                <ConnectionStatus contract={augmintToken} />

                <Statistic.Group widths="3" size={size}>
                    <Statistic data-testid="feeAccountTokenBalance" style={{ padding: "1em" }}>
                        <Statistic.Label>A-EUR fee account</Statistic.Label>
                        <Statistic.Value>{feeAccountTokenBalance} A-EUR</Statistic.Value>
                    </Statistic>

                    <Statistic data-testid="feeAccountTokenBalance" style={{ padding: "1em" }}>
                        <Statistic.Label>ETH fee account</Statistic.Label>
                        <Statistic.Value>{feeAccountEthBalance} ETH</Statistic.Value>
                    </Statistic>

                    <Statistic data-testid="interestEarnedAccountTokenBalance" style={{ padding: "1em" }}>
                        <Statistic.Label>Earned interest account</Statistic.Label>
                        <Statistic.Value>{interestEarnedAccountTokenBalance} A-EUR</Statistic.Value>
                    </Statistic>
                </Statistic.Group>
            </Segment>
        );
    }
}

EarningStats.defaultProps = {
    size: "small"
};
