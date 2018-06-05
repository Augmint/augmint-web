import React from "react";
import { ConnectionStatus } from "components/MsgPanels";
import Segment from "components/augmint-ui/segment";
import Statistic from "components/augmint-ui/statistic";

export class EarningStats extends React.Component {
    render() {
        const { augmintToken, monetarySupervisor } = this.props;

        const { isLoaded, isLoading, loadError } = this.props.augmintToken;
        const { feeAccountTokenBalance, feeAccountEthBalance } = augmintToken.info;

        const { interestEarnedAccountTokenBalance } = monetarySupervisor.info;

        return (
            <Segment className="vertical" loading={isLoading || (!isLoaded && !loadError)}>
                <ConnectionStatus contract={augmintToken} />
                <Statistic.Group>
                    <Statistic
                        data-testid="feeAccountTokenBalance"
                        style={{ padding: "1em" }}
                        label="A-EUR fee account"
                        value={feeAccountTokenBalance + " A-EUR"}
                    />

                    <Statistic
                        data-testid="feeAccountTokenBalance"
                        style={{ padding: "1em" }}
                        label="ETH fee account"
                        value={feeAccountEthBalance + " ETH"}
                    />

                    <Statistic
                        data-testid="interestEarnedAccountTokenBalance"
                        style={{ padding: "1em" }}
                        label="Earned interest account"
                        value={interestEarnedAccountTokenBalance + " A-EUR"}
                    />
                </Statistic.Group>
            </Segment>
        );
    }
}
