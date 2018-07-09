import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ConnectionStatus } from "components/MsgPanels";
import AccountAddress from "components/accountAddress";
import { StyledAccountInfo, StyledAccountP, StyledAccInfoLink } from "./styles";
import Icon from "components/augmint-ui/icon";

export class AccountInfo extends React.Component {
    render() {
        const {
            header,
            showMyAccountLink,
            data,
            augmintToken,
            userBalancesIsLoading,
            hideTestId,
            className,
            toggleAccInfo
        } = this.props;
        return (
            <StyledAccountInfo
                data-testid={!hideTestId && "accountInfoBlock"}
                className={className + " accountInfo"}
                loading={
                    augmintToken.isLoading ||
                    (!augmintToken.isLoaded && !augmintToken.loadError) ||
                    userBalancesIsLoading
                }
                header={header}
            >
                <ConnectionStatus contract={augmintToken} />
                <StyledAccountP>
                    Account address:
                    <p style={{ margin: "0px" }}>
                        <AccountAddress
                            address={data.account.address}
                            showCopyIcon="true"
                            title=""
                            style={{ fontWeight: "lighter" }}
                        />
                    </p>
                </StyledAccountP>
                <StyledAccountP>
                    Balance:
                    <p style={{ margin: "0px" }}>
                        ETH: <span data-testid={!hideTestId && "userEthBalance"}>{data.account.ethBalance}</span>
                    </p>
                    <p>
                        A-EUR: <span data-testid={!hideTestId && "userAEurBalance"}>{data.account.tokenBalance}</span>
                    </p>
                </StyledAccountP>
                <StyledAccountP className="accInfoDetail">€/ETH {data.rates.info.ethFiatRate}</StyledAccountP>
                <StyledAccInfoLink
                    title="Under the hood"
                    to="/under-the-hood"
                    onClick={() => toggleAccInfo(null, null, true)}
                >
                    <Icon name="connect" />
                    {data.web3Connect.network.name}
                </StyledAccInfoLink>
                {showMyAccountLink && <Link to="/account">More details</Link>}
            </StyledAccountInfo>
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
