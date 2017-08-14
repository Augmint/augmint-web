import React from "react";
import { connect } from "react-redux";
import { Panel } from "react-bootstrap";
import { Link } from "react-router-dom";

export class AccountInfo extends React.Component {
    render() {
        const {
            header,
            showMyAccountLink,
            account,
            tokenUcdIsConnected,
            userBalancesIsLoading
        } = this.props;
        return (
            <Panel header={header}>
                {!tokenUcdIsConnected &&
                    <p>Connecting to tokenUcd contract...</p>}
                {userBalancesIsLoading && <p>Refreshing account info...</p>}
                <p>
                    Account: {account.address}
                </p>
                <p>
                    Balances: {account.ethBalance} ETH | {account.ucdBalance}{" "}
                    UCD
                </p>
                {showMyAccountLink &&
                    <Link to="/account">My account details</Link>}
            </Panel>
        );
    }
}

AccountInfo.defaultProps = {
    header: <h3>My Account</h3>,
    showMyAccountLink: false
};

const mapStateToProps = state => ({
    userBalancesIsLoading: state.userBalances.isLoading,
    tokenUcdIsConnected: state.tokenUcd.isConnected
});

export default connect(mapStateToProps)(AccountInfo);
