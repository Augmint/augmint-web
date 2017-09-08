import React from "react";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";
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
            <Pblock header={header}>
                {!tokenUcdIsConnected && (
                    <p>Connecting to tokenUcd contract...</p>
                )}
                {userBalancesIsLoading && <p>Refreshing account info...</p>}
                <p>Account: {account.address}</p>
                <p>
                    ETH: {account.ethBalance}
                    {account.ethPendingBalance !== "?" &&
                    account.ethPendingBalance - account.ethBalance !== 0 && (
                        <span>
                            {" "}
                            (Pending:{" "}
                            {account.ethPendingBalance - account.ethBalance} )
                        </span>
                    )}
                </p>
                <p>
                    UCD: {account.ucdBalance}
                    {account.ucdPendingBalance !== "?" &&
                    account.ucdPendingBalance - account.ucdBalance !== 0 && (
                        <span>
                            {" "}
                            (Pending:{" "}
                            {account.ucdPendingBalance - account.ucdBalance} )
                        </span>
                    )}
                </p>
                {showMyAccountLink && <Link to="/account">More details</Link>}
            </Pblock>
        );
    }
}

AccountInfo.defaultProps = {
    header: "My Account",
    showMyAccountLink: false
};

const mapStateToProps = state => ({
    userBalancesIsLoading: state.userBalances.isLoading,
    tokenUcdIsConnected: state.tokenUcd.isConnected
});

export default connect(mapStateToProps)(AccountInfo);
