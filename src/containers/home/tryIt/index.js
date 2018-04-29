import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { LoadingPanel } from "components/MsgPanels";
import { Tsegment } from "components/TextContent";
import { Link } from "react-router-dom";
import Button from "../../../components/augmint-ui/button";
import { HowToConnect } from "./HowToConnect";
import { TryItConnected } from "./TryItConnected";
import { Disclaimer } from "./Disclaimer";

class TryIt extends React.Component {
    componentDidMount() {
        connectWeb3();
    }

    render() {
        const { isLoading, isConnected } = this.props.web3Connect;
        return (
            <Tsegment header="Try Augmint">
                <Disclaimer />
                {isLoading && <LoadingPanel header="Trying to connect to Ethereum network..." />}
                {!isLoading && !isConnected && <HowToConnect />}
                {!isLoading && isConnected && <TryItConnected />}

                <Tsegment.Row centered columns={1}>
                    <Tsegment.Column textAlign="center">
                        <Button
                            content="Read more about the concept"
                            as={Link}
                            to="/concept#"
                            icon="angle-right"
                            labelPosition="right"
                            size="large"
                        />
                    </Tsegment.Column>
                </Tsegment.Row>
            </Tsegment>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    augmintToken: state.augmintToken
});

export default connect(mapStateToProps)(TryIt);
