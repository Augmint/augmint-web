import React from "react";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";
import { Link } from "react-router-dom";
import { ConnectionStatus } from "components/MsgPanels";

export class AccountInfo extends React.Component {
    render() {
        const { header, showMyAccountLink, account, augmintToken, userBalancesIsLoading } = this.props;
        return (
            <Pblock
                loading={
                    augmintToken.isLoading ||
                    (!augmintToken.isConnected && !augmintToken.connectionError) ||
                    userBalancesIsLoading
                }
                header={header}
            >
                <ConnectionStatus contract={augmintToken} />

                <p>Account: {account.address}</p>
                <p>
                    ETH: {account.ethBalance}
                    {account.ethPendingBalance !== "?" &&
                        account.ethPendingBalance - account.ethBalance !== 0 && (
                            <span> (Pending: {account.ethPendingBalance - account.ethBalance} )</span>
                        )}
                </p>
                <p>
                    ACE: <span id="userAceBalance">{account.tokenBalance}</span>
                    {account.pendingTokenBalance !== "?" &&
                        account.pendingTokenBalance - account.tokenBalance !== 0 && (
                            <span> (Pending: {account.pendingTokenBalance - account.tokenBalance} )</span>
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
    augmintToken: state.augmintToken
});

export default connect(mapStateToProps)(AccountInfo);
