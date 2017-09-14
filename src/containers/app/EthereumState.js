/*  TODO: add syncing
    TODO: add if pendng transation is there and display confirmation count
*/
import React from "react";
import { connect } from "react-redux";
import { Container } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { ErrorPanel, WarningPanel, LoadingPanel } from "components/MsgPanels";
import ErrorDetails from "components/ErrorDetails";

export class EthereumState extends React.Component {
    render() {
        let msg = null;
        const {
            web3Connect,
            loanManager,
            rates,
            tokenUcd,
            exchange
        } = this.props;
        const {
            isConnected,
            isLoading,
            network,
            error
        } = this.props.web3Connect;
        if (isLoading) {
            msg = <LoadingPanel header="Connecting to Ethereum network..." />;
        } else if (!isConnected && !isLoading) {
            msg = (
                <WarningPanel header={<h3>Can't connect Ethereum network</h3>}>
                    <p>
                        To use this app you need an Ethereum capable browser
                        (eg. Mist) or Chrome with Metamask plugin
                    </p>
                    <p>
                        Please check our{" "}
                        <Link to="/help/connecting">connection guide</Link>{" "}
                        about how to connect to Ethereum network.
                    </p>

                    {web3Connect.error && (
                        <ErrorDetails header="Connection error details:">
                            {error.message}
                        </ErrorDetails>
                    )}
                </WarningPanel>
            );
        } else if (
            isConnected &&
            network.id !== "999" &&
            network.id !== "4" &&
            network.id !== "3" &&
            network.id !== "1976"
        ) {
            msg = (
                <WarningPanel header={<h3>Not on Rinkeby or local testrpc</h3>}>
                    <p>
                        Your browser seems to be connected to{" "}
                        {web3Connect.network.name} (id: {web3Connect.network.id}).
                    </p>
                    <p>
                        This application only works on Rinkeby test network or
                        on a local installation at the moment.
                    </p>
                    <p>
                        Make sure you are connected to Rinkeby or for local
                        install follow instructions on our{" "}
                        <Link
                            to="https://github.com/DecentLabs/dcm-poc/blob/master/docs/developmentEnvironment.md"
                            target="_blank"
                        >
                            Github page
                        </Link>.
                    </p>
                </WarningPanel>
            );
        } else if (
            loanManager.connectionError ||
            rates.connectionError ||
            tokenUcd.connectionError ||
            (exchange && rates.connectionError)
        ) {
            msg = (
                <ErrorPanel header={<h3>Can't connect to UCD contracts</h3>}>
                    <p>
                        You seem to be connected to {network.name} but can't
                        connect to DCM contracts.
                    </p>
                    {(network.id === "4" || network.id === "3") && (
                        <p>
                            It's an issue with our deployement, because you are
                            on {network.name} and DCM contracts should be
                            deployed.
                        </p>
                    )}
                    {network.id !== "4" &&
                    network.id !== "3" && (
                        <div>
                            <p>Do you have all the contracts deployed?</p>
                            <pre>
                                {"truffle migrate --reset" +
                                    "\ncp ./build/contracts/* ./src/contractsBuild"}
                            </pre>
                            <p>
                                See more on our{" "}
                                <Link
                                    to="https://github.com/DecentLabs/dcm-poc/blob/master/docs/developmentEnvironment.md"
                                    target="_blank"
                                >
                                    Github page
                                </Link>
                            </p>
                        </div>
                    )}
                    <p>Error(s):</p>
                    <ErrorDetails>
                        {loanManager.connectionError ? (
                            loanManager.connectionError.message + "\n"
                        ) : (
                            ""
                        )}
                        {rates.connectionError ? (
                            rates.connectionError.message + "\n"
                        ) : (
                            ""
                        )}
                        {tokenUcd.connectionError ? (
                            tokenUcd.connectionError.message + "\n"
                        ) : (
                            ""
                        )}
                        {exchange.connectionError ? (
                            exchange.connectionError.message
                        ) : (
                            ""
                        )}
                    </ErrorDetails>
                </ErrorPanel>
            );
        }

        if (msg) {
            msg = <Container>{msg}</Container>;
        }
        return msg;
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    loanManager: state.loanManager,
    rates: state.rates,
    tokenUcd: state.tokenUcd,
    exchange: state.exchange
});

export default (EthereumState = connect(mapStateToProps)(EthereumState));
