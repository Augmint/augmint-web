import React from "react";
import { ConnectionStatus } from "components/MsgPanels";
import Segment from "components/augmint-ui/segment";
import Statistic from "components/augmint-ui/statistic";
import { Pgrid } from "components/PageLayout";

export class EarningStats extends React.Component {
    render() {
        const { augmintToken, monetarySupervisor } = this.props;

        const { isLoaded, isLoading, loadError } = this.props.augmintToken;
        const { feeAccountTokenBalance, feeAccountEthBalance } = augmintToken.info;

        const { interestEarnedAccountTokenBalance } = monetarySupervisor.info;

        return (
            <Segment className="vertical" loading={isLoading || (!isLoaded && !loadError)} style={{ padding: 0 }}>
                <ConnectionStatus contract={augmintToken} />
                <Pgrid>
                    <Pgrid.Row halign="justify">
                        <Pgrid.Column size={{ tablet: 1, desktop: 1 / 3 }}>
                            <Statistic
                                data-testid="feeAccountTokenBalance"
                                label="A-EUR fee account"
                                value={feeAccountTokenBalance + " A€"}
                            />
                        </Pgrid.Column>
                        <Pgrid.Column size={{ tablet: 1, desktop: 1 / 3 }}>
                            <Statistic
                                data-testid="feeAccountTokenBalance"
                                label="ETH fee account"
                                value={
                                    (feeAccountEthBalance > 0 ? Number(feeAccountEthBalance).toFixed(4) : 0) + " ETH"
                                }
                            />
                        </Pgrid.Column>
                        <Pgrid.Column size={{ tablet: 1, desktop: 1 / 3 }}>
                            <Statistic
                                data-testid="interestEarnedAccountTokenBalance"
                                label="Earned interest account"
                                value={interestEarnedAccountTokenBalance + " A€"}
                            />
                        </Pgrid.Column>
                    </Pgrid.Row>
                </Pgrid>
            </Segment>
        );
    }
}
