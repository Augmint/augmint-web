import React from "react";
import { Statistic, Segment } from "semantic-ui-react";
import { ConnectionStatus } from "components/MsgPanels";

export class LtdStats extends React.Component {
    render() {
        const { isLoaded, isLoading, loadError } = this.props.monetarySupervisor;
        const { monetarySupervisor, size } = this.props;
        const { totalLockedAmount, totalLoanAmount, ltdPercent } = this.props.monetarySupervisor.info;
        const { loanCount } = this.props.loanManager.info;
        const { lockCount } = this.props.lockManager.info;

        return (
            <Segment vertical textAlign="center" loading={isLoading || (!isLoaded && !loadError)}>
                <ConnectionStatus contract={monetarySupervisor} />

                <Statistic.Group widths="3" size={size}>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>Total locked</Statistic.Label>
                        <Statistic.Value data-testid="totalSupply">{totalLockedAmount} A-EUR</Statistic.Value>
                        {lockCount > 0 && <p>in {lockCount} locks (incl. released)</p>}
                    </Statistic>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>Total loans</Statistic.Label>
                        <Statistic.Value data-testid="reserveEthBalance">{totalLoanAmount} A-EUR</Statistic.Value>
                        {loanCount > 0 && <p>{loanCount} loans (incl. repaid&defaulted)</p>}
                    </Statistic>

                    <Statistic data-testid="reserveTokenBalance" style={{ padding: "1em" }}>
                        <Statistic.Label>Loan to Deposit ratio</Statistic.Label>
                        <Statistic.Value>
                            {totalLockedAmount === 0 ? "N/A" : `${(ltdPercent * 100).toFixed(2)} %`}{" "}
                        </Statistic.Value>
                    </Statistic>
                </Statistic.Group>
            </Segment>
        );
    }
}

LtdStats.defaultProps = {
    size: "small"
};
