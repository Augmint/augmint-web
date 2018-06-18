import React from "react";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";
import { Link } from "react-router-dom";
import { ConnectionStatus } from "components/MsgPanels";
import Icon from "components/augmint-ui/icon";

import { shortAccountAddresConverter } from "utils/converter";

export class AccountInfo extends React.Component {
    render() {
        const { header, showMyAccountLink, account, augmintToken, userBalancesIsLoading } = this.props;

        function copyAddress() {
            const el = document.createElement("textarea");
            el.value = account.address;
            el.setAttribute("readonly", "");
            el.style.position = "absolute";
            el.style.left = "-9999px";
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
        }

        return (
            <Pblock
                data-testid="accountInfoBlock"
                className="accountInfo"
                loading={
                    augmintToken.isLoading ||
                    (!augmintToken.isLoaded && !augmintToken.loadError) ||
                    userBalancesIsLoading
                }
                header={header}
            >
                <ConnectionStatus contract={augmintToken} />

                <p>
                    Account: {shortAccountAddresConverter(account.address)}
                    <span onClick={copyAddress}>
                        <Icon name="copy" style={{ paddingLeft: 5, cursor: "pointer" }} />
                    </span>
                </p>
                <p>
                    ETH: <span data-testid="userEthBalance">{account.ethBalance}</span>
                </p>
                <p>
                    A-EUR: <span data-testid="userAEurBalance">{account.tokenBalance}</span>
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
