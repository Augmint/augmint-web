import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { LoadingPanel } from "components/MsgPanels";
import { Tsegment } from "components/TextContent";
import Header from "components/augmint-ui/header";
import Button from "components/augmint-ui/button";
import { HowToConnect } from "./HowToConnect";
import { TryItConnected } from "./TryItConnected";
import { Disclaimer } from "./Disclaimer";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";

import { FeatureContext } from "modules/services/featureService";

class TryIt extends React.Component {
    componentDidMount() {
        connectWeb3();
    }

    render() {
        const { isLoading, isConnected, error } = this.props.web3Connect;
        return (
            <FeatureContext>
                {features => {
                    const dashboard = features.dashboard;
                    return (
                        <div>
                            { dashboard  &&
                                <TopNavTitlePortal>
                                    {dashboard && <Header as="h1" className="secondaryColor" content="Try Augmint" />}
                                </TopNavTitlePortal>
                            }
                            <Tsegment header={ dashboard ? "" : "Try Augmint" }>
                                <Disclaimer />
                                {isLoading && <LoadingPanel header="Trying to connect to Ethereum network..." />}
                                {!isLoading && error && <HowToConnect />}
                                {!isLoading && isConnected && <TryItConnected />}

                                <Tsegment.Row columns={1}>
                                    <Tsegment.Column>
                                        <Button
                                            content="Read more about the concept"
                                            to="/concept#"
                                            icon="angle-right"
                                            labelposition="right"
                                            size="large"
                                        />
                                    </Tsegment.Column>
                                </Tsegment.Row>
                            </Tsegment>
                        </div>
                    );
                }}
            </FeatureContext>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    augmintToken: state.augmintToken
});

export default connect(mapStateToProps)(TryIt);
