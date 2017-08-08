/*  TODO: add syncing
    TODO: add if pendng transation is there and display confirmation count
*/
import React from "react";
import { connect } from "react-redux";
import { Button, Grid, Row, Col } from "react-bootstrap";
import { ErrorPanel, InfoPanel } from "components/MsgPanels";
//import stringifier from "stringifier";

//const stringify = stringifier({ maxDepth: 3, indent: "   " });

function LocalInstallInstructions(props) {
    return (
        <div>
            <p>
                This application only works on a local installation at the
                moment.
            </p>
            <p>
                Follow instructions on our{" "}
                <Button
                    bsStyle="link"
                    href="https://github.com/DecentLabs/ucd-poc/blob/master/docs/developmentEnvironment.md"
                    target="_blank"
                >
                    Github page
                </Button>{" "}
                about how to install and run it locally.
            </p>
            <p>If you already installed then check if testrpc is running.</p>
            <p>
                If you are using Metamask then check if it's connected to
                localhost{" "}
            </p>
        </div>
    );
}

export class EthereumState extends React.Component {
    render() {
        let msg = null;
        const { ethBase, loanManager, rates, tokenUcd } = this.props;
        if (ethBase.isLoading) {
            msg = (
                <InfoPanel
                    header={<h3>Connecting to Ethereum network....</h3>}
                />
            );
        } else if (ethBase.error) {
            msg = (
                <ErrorPanel header={<h3>Can't connect Ethereum network</h3>}>
                    <p>To use this app you need an Ethereum capable browser (eg. Mist) or Chrome with Metamask plugin</p>
                    <LocalInstallInstructions ethBase={this.props.ethBase} />
                    <p>Error details:</p>
                    <pre>
                        {ethBase.error.message}
                        {ethBase.error.stack}
                    </pre>
                </ErrorPanel>
            );
        } else if (ethBase.isConnected && ethBase.network.id !== "999") {
            msg = (
                <ErrorPanel header={<h3>Not on local testrpc</h3>}>
                    <p>
                        Your browser seems to be connected to {ethBase.network.name}{" "}
                        (id: {ethBase.network.id}).
                    </p>
                    <LocalInstallInstructions ethBase={this.props.ethBase}/>
                </ErrorPanel>
            );
        } else if (loanManager.error || rates.error || tokenUcd.error) {
            msg = (
                <ErrorPanel header={<h3>Can't connect to UCD contracts</h3>}>
                    <p>
                        You seem to be connected to local testrpc but can't find UCD contracts.<br />
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
                    <p>
                        Error(s):<br />
                        <pre>
                            {loanManager.error
                                ? loanManager.error.message + "\n"
                                : ""}
                            {rates.error ? rates.error.message + "\n" : ""}
                            {tokenUcd.error ? tokenUcd.error.message : ""}
                        </pre>
                    </p>
                </ErrorPanel>
            );
        }

        if (msg) {
            msg = (
                <Grid>
                    <Row>
                        <Col>
                            {msg}
                        </Col>
                    </Row>
                </Grid>
            );
        }
        return msg;
    }
}

const mapStateToProps = state => ({
    ethBase: state.ethBase,
    loanManager: state.loanManager,
    rates: state.rates,
    tokenUcd: state.tokenUcd
});

export default (EthereumState = connect(mapStateToProps)(EthereumState));
