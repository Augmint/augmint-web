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
        const { web3Connect, contracts, loanManager, rates, augmintToken, exchange, children = null } = this.props;
        const { network } = web3Connect;
        const isConnected = web3Connect.isConnected && contracts.isConnected;

        const anyLoading =
            web3Connect.isLoading ||
            contracts.isLoading ||
            augmintToken.isLoading ||
            rates.isLoading ||
            loanManager.isLoading ||
            document.readyState !== "complete";

        const anyConnectionError =
            web3Connect.error ||
            contracts.error ||
            loanManager.connectionError ||
            rates.connectionError ||
            augmintToken.connectionError ||
            (exchange && rates.connectionError);

        if (web3Connect.isLoading || contracts.isLoading || document.readyState !== "complete") {
            msg = <LoadingPanel header="Connecting to Ethereum network..." />;
        } else if (!isConnected && !anyLoading) {
            msg = (
                <WarningPanel header="Can't connect Ethereum network">
                    <p>
                        Please check our <Link to="/tryit">connection guide</Link> about how to connect to Ethereum
                        network.
                    </p>

                    {web3Connect.error && (
                        <ErrorDetails header="Web3 connection error details:">{web3Connect.error.message}</ErrorDetails>
                    )}
                    {contracts.error && (
                        <ErrorDetails header="Augmint contracts connection error details:">
                            {contracts.error.message}
                        </ErrorDetails>
                    )}
                </WarningPanel>
            );
        } else if (
            isConnected &&
            network.id !== 999 &&
            network.id !== 4 &&
            network.id !== 3 &&
            network.id !== 1976 &&
            network.id !== 4447
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
                    {(network.id === 4 || network.id === 3) && (
                        <p>
                            It's an issue with our deployement, because you are on {network.name} and Augmint contracts
                            should be deployed.
                        </p>
                    )}
                    {network.id !== 4 &&
                        network.id !== 3 && (
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
                        {contracts.error ? contracts.error.message : ""}
                        {loanManager.connectionError ? loanManager.connectionError.message + "\n" : ""}
                        {rates.connectionError ? rates.connectionError.message + "\n" : ""}
                        {augmintToken.connectionError ? augmintToken.connectionError.message + "\n" : ""}
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
    contracts: state.contracts
});

export default (EthereumState = connect(mapStateToProps)(EthereumState));
