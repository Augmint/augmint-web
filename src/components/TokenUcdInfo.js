import React from "react";
import { connect } from "react-redux";
import { Panel } from "react-bootstrap";
import { Link } from "react-router-dom";

export class TokenUcdInfo extends React.Component {
    render() {
        const {
            header,
            showTokenUcdLink,
            tokenUcdIsConnected,
            tokenUcdIsLoading,
            tokenUcd
        } = this.props;

        return (
            <Panel header={header}>
                {!tokenUcdIsConnected &&
                    <p>Connecting to tokenUcd contract...</p>}

                {tokenUcdIsLoading && <p>Refreshing tokenUcd info...</p>}

                <p>
                    Total token supply: {tokenUcd.info.totalSupply} UCD
                </p>
                <p>
                    ETH Reserve: {tokenUcd.info.ethBalance} ETH
                </p>
                <p>
                    UCD Reserve: {tokenUcd.info.ucdBalance} UCD
                </p>

                {showTokenUcdLink && <Link to="/tokenUcd">More details</Link>}
            </Panel>
        );
    }
}

TokenUcdInfo.defaultProps = {
    header: <h3>TokenUcd Status</h3>,
    showTokenUcdLink: false
};

const mapStateToProps = state => ({
    tokenUcdIsConnected: state.tokenUcd.isConnected,
    tokenUcdIsLoading: state.tokenUcd.isLoading,
    tokenUcd: state.tokenUcd
});

export default connect(mapStateToProps)(TokenUcdInfo);
