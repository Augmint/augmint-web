import React from "react";
import { connect } from "react-redux";
import { Hero } from "./Hero";
import { DcmOverview } from "./DcmOverview";
import { ProjectStatus } from "./ProjectStatus";
import { LoadingPanel } from "components/MsgPanels";
import { Tsegment } from "components/TextContent";
import { Link } from "react-router-dom";

class NotConnectedHome extends React.Component {
    render() {
        const { isLoading } = this.props.web3Connect;

        return (
            <div>
                <Hero />
                {isLoading && (
                    <LoadingPanel header="Connecting to Ethereum network..." />
                )}
                <DcmOverview />
                <ProjectStatus />

                <Tsegment header="Try it out">
                    <Tsegment.Row>
                        <p>Play with our proof-of-concept implementation.</p>
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
                    </Tsegment.Row>
                </Tsegment>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect
});

export default connect(mapStateToProps)(NotConnectedHome);
