import React from "react";
import { connect } from "react-redux";
import { Hero } from "./Hero";
import { ConnectingEthereum } from "containers/app/ConnectingEthereum";
import { Psegment } from "components/PageLayout";
import { Header, Container } from "semantic-ui-react";
import { Link } from "react-router-dom";

class NotConnectedHome extends React.Component {
    render() {
        const { isLoading } = this.props.web3Connect;

        if (isLoading) {
            return <ConnectingEthereum />;
        } else {
            return (
                <div>
                    <Hero />
                    <Psegment
                        style={{ minHeight: 400, padding: "2em 0em" }}
                        vertical
                    >
                        <Container text>
                            <Header
                                as="h2"
                                style={{
                                    fontSize: "1.7em",
                                    fontWeight: "normal"
                                }}
                            >
                                Try it out
                            </Header>
                            <p>
                                Play with our proof-of-concept implementation.
                            </p>
                            <p>
                                Install{" "}
                                <Link to="https://metamask.io/" target="_blank">
                                    Metamask Chrome plugin
                                </Link>{" "}
                                or{" "}
                                <Link
                                    to="https://github.com/ethereum/mist/releases"
                                    target="_blank"
                                >
                                    Mist browser
                                </Link>{" "}
                                and connect to Rinkeby test network
                            </p>
                        </Container>
                    </Psegment>
                </div>
            );
        }
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect
});

export default connect(mapStateToProps)(NotConnectedHome);
