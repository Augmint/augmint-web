import React from "react";
import { ConnectionStatus } from "components/MsgPanels";
import Segment from "components/augmint-ui/segment";
import Statistic from "components/augmint-ui/statistic";

export class TotalSupply extends React.Component {
    render() {
        const { augmintToken, monetarySupervisor, showDetails } = this.props;

        const { isLoaded, isLoading, loadError } = this.props.augmintToken;
        const { totalSupply } = augmintToken.info;

        const { issuedByMonetaryBoard } = monetarySupervisor.info;

        return (
            <Segment className="vertical" loading={isLoading || (!isLoaded && !loadError)}>
                <ConnectionStatus contract={augmintToken} />

                <Statistic.Group className="centered">
                    <Statistic
                        data-testid="totalSupply"
                        style={{ padding: "1em" }}
                        label="Total supply"
                        value={totalSupply + " A-EUR"}
                    >
                        {showDetails && (
                            <p data-testid="issuedByMonetaryBoard" style={{ textAlign: "center" }}>
                                {issuedByMonetaryBoard} A-EUR issued by Stability Board
                            </p>
                        )}
                    </Statistic>
                </Statistic.Group>
            </Segment>
        );
    }
}

TotalSupply.defaultProps = {
    showDetails: true
};
