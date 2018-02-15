import React from "react";
import store from "modules/store";
import { setupWeb3 } from "modules/reducers/web3Connect";
import { ErrorPanel } from "components/MsgPanels";
import stringifier from "stringifier";
import { Button } from "semantic-ui-react";
import { Pblock } from "components/PageLayout";

export default class Web3ConnectionInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            providerInfoOpen: false
        };
    }

    render() {
        const { isLoading, isConnected, web3Instance, network, error, info } = this.props.web3Connect;
        const stringify = stringifier({ maxDepth: 3, indent: "   " });
        const handleRefreshClick = e => {
            e.preventDefault();
            store.dispatch(setupWeb3());
        };
        return (
            <Pblock header="Web3 connection">
                <p testid="web3ConnectionInfo">
                    {isConnected ? "connected - " + web3Instance.currentProvider.constructor.name : "not connected"} |{" "}
                    {isLoading ? "Loading..." : "not loading"}
                </p>
                <p>Web3 version: {info.web3Version}</p>
                <p>
                    Network: {network.name} | Id: {network.id} | Type: {network.type}
                </p>

                {error ? <ErrorPanel header="Error">{error.message}</ErrorPanel> : <p>No connection error</p>}

                <Button
                    basic
                    size="small"
                    onClick={() =>
                        this.setState({
                            providerInfoOpen: !this.state.providerInfoOpen
                        })
                    }
                >
                    {this.state.providerInfoOpen ? "<< Hide provider info" : "Show provider info >>"}
                </Button>
                {this.state.providerInfoOpen && (
                    <Pblock>
                        <pre style={{ fontSize: "0.8em", overflow: "auto" }}>
                            {web3Instance ? stringify(web3Instance.currentProvider) : "No web3 Instance"}
                        </pre>
                    </Pblock>
                )}

                <Button size="small" onClick={handleRefreshClick}>
                    Reconnect web3
                </Button>
            </Pblock>
        );
    }
}
