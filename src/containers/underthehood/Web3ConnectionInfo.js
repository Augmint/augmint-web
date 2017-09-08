import React from "react";
import store from "modules/store";
import { Panel, Button } from "react-bootstrap";
import { setupWeb3 } from "modules/reducers/web3Connect";
import ErrorDetails from "components/ErrorDetails";
import stringifier from "stringifier";

export default class Web3ConnectionInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            providerInfoOpen: false
        };
    }

    render() {
        const {
            isLoading,
            isConnected,
            web3ConnectionId,
            web3Instance,
            network,
            error
        } = this.props.web3Connect;
        const stringify = stringifier({ maxDepth: 3, indent: "   " });
        const handleRefreshClick = e => {
            e.preventDefault();
            store.dispatch(setupWeb3());
        };
        return (
            <Panel header={<h3>Web3 connection</h3>}>
                <p>
                    {isConnected ? (
                        "connected - " +
                        web3Instance.currentProvider.constructor.name
                    ) : (
                        "not connected"
                    )}{" "}
                    | {isLoading ? "Loading..." : "not loading"}
                </p>

                <p>
                    Network: {network.name} Id: {network.id}
                </p>
                <p>Internal Connection Id: {web3ConnectionId}</p>

                {error ? (
                    <p>
                        error: <br />{" "}
                        <ErrorDetails style={{ fontSize: 10 + "px" }}>
                            {error.message}
                        </ErrorDetails>
                    </p>
                ) : (
                    <p>No connection error</p>
                )}

                <div>
                    <Button
                        bsStyle="link"
                        onClick={() =>
                            this.setState({
                                providerInfoOpen: !this.state.providerInfoOpen
                            })}
                    >
                        {this.state.providerInfoOpen ? (
                            "<< Hide provider info"
                        ) : (
                            "Show provider info >>"
                        )}
                    </Button>
                    <Panel collapsible expanded={this.state.providerInfoOpen}>
                        <pre style={{ fontSize: 10 + "px" }}>
                            {web3Instance ? (
                                stringify(web3Instance.currentProvider)
                            ) : (
                                "No web3 Instance"
                            )}
                        </pre>
                    </Panel>
                </div>

                <Button bsSize="small" onClick={handleRefreshClick}>
                    Reconnect web3
                </Button>
            </Panel>
        );
    }
}
