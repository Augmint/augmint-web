import React from "react";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";
import { Link } from "react-router-dom";
import { ConnectionStatus } from "components/MsgPanels";
import AccountAddress from "components/accountAddress";

export class AccountInfo extends React.Component {
    render() {
        const { header, showMyAccountLink, account, augmintToken, userBalancesIsLoading, hideTestId } = this.props;
        return (
            <Pblock
                data-testid={!hideTestId && "accountInfoBlock"}
                className="accountInfo"
                loading={
                    augmintToken.isLoading ||
                    (!augmintToken.isLoaded && !augmintToken.loadError) ||
                    userBalancesIsLoading
                }
                header={header}
                style={{ padding: "0px 10px", border: "1px solid #ffad00", borderRadius: "0px 0px 5px 5px"}}
            >
                <ConnectionStatus contract={augmintToken} />

                <p style={{ fontWeight: "bolder" }}>
                    Account address:
                    <p style={{ margin: "0px" }}>
                        <AccountAddress address={account.address} showCopyIcon="true" title="" style={{ fontWeight: "lighter" }}/>
                    </p>
                </p>
                <p style={{ fontWeight: "bolder" }}>
                    Balance:
                    <p style={{ marginBottom: "8px", marginTop: "0px" }}>
                        ETH: <span data-testid={!hideTestId && "userEthBalance"}>{account.ethBalance}</span>
                    </p>
                    <p style={{ marginTop: "8px", marginBottom: "0px" }}>
                        A-EUR: <span data-testid={!hideTestId && "userAEurBalance"}>{account.tokenBalance}</span>
                    </p>
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
