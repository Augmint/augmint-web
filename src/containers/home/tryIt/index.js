import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { LoadingPanel } from "components/MsgPanels";
import { Tsegment } from "components/TextContent";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";
import { HowToConnect } from "./HowToConnect";
import { TryItConnected } from "./TryItConnected";

class TryIt extends React.Component {
    componentDidMount() {
        connectWeb3();
    }

    render() {
        const { isLoading, isConnected } = this.props.web3Connect;
        return (
            <Tsegment header="Try Augmint">
                {isLoading && <LoadingPanel header="Trying to connect to Ethereum network..." />}
                {!isLoading && !isConnected && <HowToConnect />}
                {!isLoading && isConnected && <TryItConnected />}

                <Tsegment.Row centered columns={1}>
                    <Tsegment.Column textAlign="center">
                        <Button
                            content="Read more about the concept"
                            as={Link}
                            to="/concept#"
                            icon="right chevron"
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
    tokenUcd: state.tokenUcd
});

export default connect(mapStateToProps)(TryIt);
