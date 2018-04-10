import React from "react";
import { Statistic, Segment } from "semantic-ui-react";
import { ConnectionStatus } from "components/MsgPanels";

export class LtdStats extends React.Component {
    render() {
        const { isConnected, isLoading, connectionError } = this.props.monetarySupervisor;
        const { monetarySupervisor, size } = this.props;
        const { totalLockedAmount, totalLoanAmount, ltdPercent } = this.props.monetarySupervisor.info;
        const { loanCount } = this.props.loanManager.info;

        return (
            <Segment vertical textAlign="center" loading={isLoading || (!isConnected && !connectionError)}>
                <ConnectionStatus contract={monetarySupervisor} />

                <Statistic.Group widths="3" size={size}>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>Total locked</Statistic.Label>
                        <Statistic.Value data-testid="totalSupply">{totalLockedAmount} A-EUR</Statistic.Value>
                    </Statistic>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>Total loans</Statistic.Label>
                        <Statistic.Value data-testid="reserveEthBalance">{totalLoanAmount} A-EUR</Statistic.Value>
                        in {loanCount} loans
                    </Statistic>

                    <Statistic data-testid="reserveTokenBalance" style={{ padding: "1em" }}>
                        <Statistic.Label>Loan to Deposit ratio</Statistic.Label>
                        <Statistic.Value>{totalLockedAmount === 0 ? "N/A" : ltdPercent * 100} %</Statistic.Value>
                    </Statistic>
                </Statistic.Group>
            </Segment>
        );
    }
}

LtdStats.defaultProps = {
    size: "small"
};
