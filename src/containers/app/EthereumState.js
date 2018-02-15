/*  TODO: add syncing
    TODO: add if pendng transation is there and display confirmation count
*/
import React from "react";
import { connect } from "react-redux";
import { Container } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { ErrorDetails, ErrorPanel, WarningPanel, LoadingPanel } from "components/MsgPanels";
import { Tsegment } from "components/TextContent";
import { DiscordButton } from "components/LinkButtons";

export class EthereumState extends React.Component {
    render() {
        let msg = null;
        const { web3Connect, loanManager, rates, augmintToken, exchange, children = null } = this.props;
        const { isConnected, isLoading, network, error } = this.props.web3Connect;

        const anyLoading =
            isLoading ||
            exchange.isLoading ||
            augmintToken.isLoading ||
            rates.isLoading ||
            loanManager.isLoading ||
            document.readyState !== "complete";
        const anyConnectionError =
            loanManager.connectionError ||
            rates.connectionError ||
            augmintToken.connectionError ||
            (exchange && rates.connectionError) ||
            (exchange && exchange.connectionError);

        if (isLoading || document.readyState !== "complete") {
            msg = <LoadingPanel header="Connecting to Ethereum network..." />;
        } else if (!isConnected && !anyLoading) {
            msg = (
                <WarningPanel header="Can't connect Ethereum network">
                    <p>
                        Please check our <Link to="/tryit">connection guide</Link> about how to connect to Ethereum
                        network.
                    </p>

                    {web3Connect.error && (
                        <ErrorDetails header="Connection error details:">{error.message}</ErrorDetails>
                    )}
                </WarningPanel>
            );
        } else if (
            isConnected &&
            network.type !== "private" &&
            network.id !== 4 // rinkeby
        ) {
            msg = (
                <div>
                    <WarningPanel header="Connected but not on Rinkeby" />
                    <p>Augmint only works on Rinkeby test network currently</p>
                    <p>
                        Your browser seems to be connected to {web3Connect.network.name} network. (id:{" "}
                        {web3Connect.network.id}).
                    </p>

                    <p>Make sure you are connected to Rinkeby </p>
                    <DiscordButton />
                    <p>
                        If you feel geeky you can{" "}
                        <Link
                            to="https://github.com/Augmint/augmint-core/blob/master/docs/developmentEnvironment.md"
                            target="_blank"
                        >
                            install it locally
                        </Link>.
                    </p>
                </div>
            );
        } else if (!anyLoading && anyConnectionError) {
            msg = (
                <ErrorPanel header={<h3>Can't connect to Augmint contracts</h3>}>
                    <p>You seem to be connected to {network.name} but can't connect to Augmint contracts.</p>
                    {network.type !== "private" && (
                        <p>
                            It's an issue with our deployement, because you are on {network.name} and Augmint contracts
                            should be deployed.
                        </p>
                    )}
                    {network.type === "private" && (
                        <div>
                            <p>Do you have all the contracts deployed?</p>
                            <pre>{"truffle migrate --reset \ncp ./build/contracts/* ./src/contractsBuild"}</pre>
                            <p>
                                See more on our{" "}
                                <Link
                                    to="https://github.com/Augmint/augmint-core/blob/master/docs/developmentEnvironment.md"
                                    target="_blank"
                                >
                                    Github page
                                </Link>
                            </p>
                        </div>
                    )}
                    <p>Error(s):</p>
                    <ErrorDetails>
                        {loanManager.connectionError ? loanManager.connectionError.message + "\n" : ""}
                        {rates.connectionError ? rates.connectionError.message + "\n" : ""}
                        {augmintToken.connectionError ? augmintToken.connectionError.message + "\n" : ""}
                        {exchange.connectionError ? exchange.connectionError.message : ""}
                    </ErrorDetails>
                </ErrorPanel>
            );
        }

        if (msg) {
            msg = (
                <Tsegment>
                    <Container text>{msg}</Container>
                </Tsegment>
            );
        } else {
            msg = children;
        }
        return msg;
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    loanManager: state.loanManager,
    rates: state.rates,
    augmintToken: state.augmintToken,
    exchange: state.exchange
});

export default (EthereumState = connect(mapStateToProps)(EthereumState));
