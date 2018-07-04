import React from "react";
import { ConnectionStatus } from "components/MsgPanels";
import Segment from "components/augmint-ui/segment";
import Statistic from "components/augmint-ui/statistic";
import { Pgrid } from "components/PageLayout";

export class LtdStats extends React.Component {
    render() {
        const { isLoaded, isLoading, loadError } = this.props.monetarySupervisor;
        const { monetarySupervisor } = this.props;
        const { totalLockedAmount, totalLoanAmount, ltdPercent } = this.props.monetarySupervisor.info;
        const { loanCount } = this.props.loanManager.info;
        const { lockCount } = this.props.lockManager.info;

        return (
            <Segment vertical textAlign="center" loading={isLoading || (!isLoaded && !loadError)}>
                <ConnectionStatus contract={monetarySupervisor} />

                <Pgrid>
                    <Pgrid.Row halign="justify">
                        <Pgrid.Column size={{ tablet: 1, desktop: 1 / 3 }}>
                            <Statistic data-testid="totalSupply" label="Total locked" value={totalLockedAmount + " A€"}>
                                {lockCount > 0 && <p>in {lockCount} locks (incl. released)</p>}
                            </Statistic>
                        </Pgrid.Column>

                        <Pgrid.Column size={{ tablet: 1, desktop: 1 / 3 }}>
                            <Statistic
                                data-testid="reserveEthBalance"
                                label="Total loans"
                                value={totalLoanAmount + " A€"}
                            >
                                {loanCount > 0 && <p>{loanCount} loans (incl. repaid&defaulted)</p>}
                            </Statistic>
                        </Pgrid.Column>

                        <Pgrid.Column size={{ tablet: 1, desktop: 1 / 3 }}>
                            <Statistic
                                data-testid="reserveTokenBalance"
                                label="Loan to Lock ratio"
                                value={totalLockedAmount === 0 ? "N/A " : `${(ltdPercent * 100).toFixed(2)} % `}
                            />
                        </Pgrid.Column>
                    </Pgrid.Row>
                </Pgrid>
            </Segment>
        );
    }
}
