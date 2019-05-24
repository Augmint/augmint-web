import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { LoadingPanel } from "components/MsgPanels";
import { Tsegment } from "components/TextContent";
import Button from "components/augmint-ui/button";
import ConnectWallet from "containers/home/connectWallet/ConnectWallet.js";

import { TryItConnected } from "./TryItConnected";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import { Pheader } from "components/PageLayout";

class TryIt extends React.Component {
    componentDidMount() {
        connectWeb3();
    }

    render() {
        const { isLoading, isConnected, error } = this.props.web3Connect;
        return (
            <div>
                {isConnected && (
                    <TopNavTitlePortal>
                        <Pheader header="Try Augmint" />
                    </TopNavTitlePortal>
                )}
                <Tsegment header={""}>
                    {isLoading && <LoadingPanel header="Trying to connect to Ethereum network..." />}
                    {!isLoading && error && <ConnectWallet styles={{ margin: "0 auto" }} />}
                    {!isLoading && isConnected && <TryItConnected web3Connect={this.props.web3Connect} />}

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
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    augmintToken: state.augmintToken
});

export default connect(mapStateToProps)(TryIt);
