/*  TODO: add syncing
    TODO: add if pendng transation is there and display confirmation count
*/
import React from "react";
import { connect } from "react-redux";
import Container from "../../components/augmint-ui/container";
import { Link } from "react-router-dom";
import { ErrorDetails, ErrorPanel, WarningPanel, LoadingPanel } from "components/MsgPanels";
import { Tsegment } from "components/TextContent";
import { DiscordButton } from "components/LinkButtons";

export class EthereumState extends React.Component {
    render() {
        let msg = null;
        const { web3Connect, contracts, augmintToken, children = null } = this.props;
        const { network } = web3Connect;

        const isConnecting = web3Connect.isLoading || contracts.isLoading || document.readyState !== "complete";

        const anyConnectionError = web3Connect.error || contracts.error || augmintToken.loadError;

        if (isConnecting) {
            msg = <LoadingPanel header="Connecting to Ethereum network..." />;
        } else if (!web3Connect.isConnected && !web3Connect.isLoading) {
            msg = (
                <WarningPanel header="Can't connect Ethereum network">
                    <p>
                        Please check our <Link to="/tryit">connection guide</Link> about how to connect to Ethereum
                        network.
                    </p>

                    {web3Connect.error && (
                        <ErrorDetails header="Web3 connection error details:" details={web3Connect.error} />
                    )}
                </WarningPanel>
            );
        } else if (
            web3Connect.isConnected &&
            !contracts.isLoaded &&
            network.id !== 999 &&
            network.id !== 4 &&
            network.id !== 1976 &&
            network.id !== 4447
        ) {
            msg = (
                <div>
                    <WarningPanel header="Connected to Ethereum but not on Rinkeby" />
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
        } else if (anyConnectionError) {
            msg = (
                <ErrorPanel header="Can't connect to Augmint contracts">
                    <p>You seem to be connected to {network.name} but can't connect to Augmint contracts.</p>
                    {network.id === 4 && (
                        <p>
                            It's an issue with our deployment, because you are on {network.name} and Augmint contracts
                            should be deployed.
                        </p>
                    )}
                    {network.id !== 4 && (
                        <div>
                            <p>Do you have all the contracts deployed?</p>
                            <p>
                                See local dev setup instructions on our{" "}
                                <Link
                                    to="https://github.com/Augmint/augmint-core/blob/master/docs/developmentEnvironment.md"
                                    target="_blank"
                                >
                                    Github page
                                </Link>
                            </p>
                        </div>
                    )}

                    <ErrorDetails details={contracts.error} />
                    <ErrorDetails details={augmintToken.loadError} />
                </ErrorPanel>
            );
        } else if (!web3Connect.userAccount) {
            msg = (
                <WarningPanel header="Can't get user acccount">
                    <p>Connected to Ethereum {network.name} network but can't get user account.</p>
                    <p>If you are using Metamask make sure it's unlocked.</p>
                </WarningPanel>
            );
        }

        if (msg) {
            msg = (
                <Tsegment>
                    <Container>{msg}</Container>
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
