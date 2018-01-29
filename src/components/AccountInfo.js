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
                className="accountInfo"
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
                        account.ethPendingBalance !== 0 && <span> (Pending: {account.ethPendingBalance} )</span>}
                </p>
                <p>
                    A&#8209;EUR: <span id="userAceBalance">{account.tokenBalance}</span>
                    {account.pendingTokenBalance !== "?" &&
                        account.pendingTokenBalance !== 0 && (
                            <span> (Pending: {typeof account.pendingTokenBalance} )</span>
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
