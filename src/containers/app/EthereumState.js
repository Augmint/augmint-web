/*  TODO: add syncing
    TODO: add if pendng transation is there and display confirmation count
*/
import React from "react";
import { connect } from "react-redux";
import { Button, Grid, Row, Col } from "react-bootstrap";
import { ErrorPanel, InfoPanel } from "components/MsgPanels";
import ErrorDetails from "components/ErrorDetails";
//import stringifier from "stringifier";

//const stringify = stringifier({ maxDepth: 3, indent: "   " });

function LocalInstallInstructions(props) {
    return (
        <div>
            <p>
                This application only works on Rinkeby test network or on a
                local installation at the moment.
            </p>
            <p>
                Make sure you are connected to Rinkeby or for local install
                follow instructions on our{" "}
                <Button
                    bsStyle="link"
                    href="https://github.com/DecentLabs/ucd-poc/blob/master/docs/developmentEnvironment.md"
                    target="_blank"
                >
                    Github page
                </Button>.
            </p>
            <p>
                If you are using Metamask then check if it's connected to
                Rinkeby or localhost for local install.
            </p>
            <p>If you already installed then check if testrpc is running.</p>
        </div>
    );
}

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
        if (web3Connect.isLoading) {
            msg = (
                <InfoPanel
                    header={<h3>Connecting to Ethereum network....</h3>}
                />
            );
        } else if (web3Connect.error) {
            msg = (
                <ErrorPanel header={<h3>Can't connect Ethereum network</h3>}>
                    <p>
                        To use this app you need an Ethereum capable browser
                        (eg. Mist) or Chrome with Metamask plugin
                    </p>
                    <LocalInstallInstructions
                        web3Connect={this.props.web3Connect}
                    />
                    <p>Error details:</p>
                    <ErrorDetails>
                        {web3Connect.error.message}
                        {web3Connect.error.stack}
                    </ErrorDetails>
                </ErrorPanel>
            );
        } else if (
            web3Connect.isConnected &&
            web3Connect.network.id !== "999" &&
            web3Connect.network.id !== "4" &&
            web3Connect.network.id !== "3" &&
            web3Connect.network.id !== "1976"
        ) {
            msg = (
                <ErrorPanel header={<h3>Not on Rinkeby or local testrpc</h3>}>
                    <p>
                        Your browser seems to be connected to{" "}
                        {web3Connect.network.name} (id: {web3Connect.network.id}).
                    </p>
                    <LocalInstallInstructions
                        web3Connect={this.props.web3Connect}
                    />
                </ErrorPanel>
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
                        You seem to be connected to {web3Connect.network.name}{" "}
                        but can't find UCD contracts.
                    </p>
                    {(web3Connect.network.id === "4" ||
                        web3Connect.network.id === "3") && (
                        <p>
                            It's an issue with our deployement, because you are
                            on {web3Connect.network.name} and UCD contracts
                            should be deployed.
                        </p>
                    )}
                    {web3Connect.network.id !== "4" &&
                    web3Connect.network.id !== "3" && (
                        <p>
                            Do you have all the contracts deployed?
                            <br />
                            <pre>
                                {"truffle migrate --reset" +
                                    "\ncp ./build/contracts/* ./src/contractsBuild"}
                            </pre>
                            <br />See more on our{" "}
                            <Button
                                bsStyle="link"
                                href="https://github.com/DecentLabs/ucd-poc/blob/master/docs/developmentEnvironment.md"
                                target="_blank"
                            >
                                Github page
                            </Button>
                        </p>
                    )}
                    <p>
                        Error(s):<br />
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
                    </p>
                </ErrorPanel>
            );
        }

        if (msg) {
            msg = (
                <Grid>
                    <Row>
                        <Col>{msg}</Col>
                    </Row>
                </Grid>
            );
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
