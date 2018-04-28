import React from "react";
import { Statistic, Segment } from "semantic-ui-react";
import { ConnectionStatus } from "components/MsgPanels";

export class TotalSupply extends React.Component {
    render() {
        const { augmintToken, monetarySupervisor, size, showDetails } = this.props;

        const { isLoaded, isLoading, loadError } = this.props.augmintToken;
        const { totalSupply } = augmintToken.info;

        const { issuedByMonetaryBoard } = monetarySupervisor.info;

        return (
            <Segment vertical textAlign="center" loading={isLoading || (!isLoaded && !loadError)}>
                <ConnectionStatus contract={augmintToken} />

                <Statistic.Group widths="1" size={size}>
                    <Statistic style={{ padding: "1em" }}>
                        <Statistic.Label>Total supply</Statistic.Label>
                        <Statistic.Value data-testid="totalSupply">{totalSupply} A-EUR</Statistic.Value>
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
    size: "small",
    showDetails: true
};
