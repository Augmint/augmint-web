import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { LoadingPanel } from "components/MsgPanels";
import { Tsegment } from "components/TextContent";
import Button from "../../../components/augmint-ui/button";
import { HowToConnect } from "./HowToConnect";
import { TryItConnected } from "./TryItConnected";
import { Disclaimer } from "./Disclaimer";

import { MobileView, DesktopView } from "./styles";

class TryIt extends React.Component {
    componentDidMount() {
        connectWeb3();
    }

    render() {
        const { isLoading, isConnected, error } = this.props.web3Connect;
        return (
            <div>
                <MobileView>What do we need to show on small screen?</MobileView>
                <DesktopView>
                    <Tsegment header="Try Augmint">
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
                </DesktopView>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    augmintToken: state.augmintToken
});

export default connect(mapStateToProps)(TryIt);
