import React from "react";
import { connect } from "react-redux";

import augmintTokenProvider from "modules/augmintTokenProvider";
import ratesProvider from "modules/ratesProvider";

import Icon from "components/augmint-ui/icon";
import AccountInfo from "components/AccountInfo";
import { shortAccountAddresConverter } from "utils/converter";

import {
    StyledTopNav,
    TitleWrapper,
    StyledTopNavUl,
    StyledTopNavLi,
    StyledTopNavLinkRight,
    StyledPrice,
    StyledAccount
} from "./styles";

class TopNav extends React.Component {
    componentDidMount() {
        augmintTokenProvider();
        ratesProvider();
    }
    render() {
        const shortAddress = shortAccountAddresConverter(this.props.userAccount.address);
        const { ethBalance, tokenBalance } = this.props.userAccount;
        return (
            <StyledTopNav className={this.props.className}>
                <TitleWrapper id="page-title" />
                <StyledTopNavUl>
                    <StyledTopNavLi>
                        <StyledPrice>
                            <span className="price">€/ETH {this.props.rates.info.ethFiatRate}</span>
                        </StyledPrice>
                    </StyledTopNavLi>
                    <StyledTopNavLi className="account">
                        <StyledPrice>
                            <span className="price">{ethBalance > 0 ? Number(ethBalance).toFixed(4) : 0} ETH</span>
                        </StyledPrice>
                        <StyledPrice>
                            <span className="price">{tokenBalance > 0 ? Number(tokenBalance).toFixed(2) : 0} A€</span>
                        </StyledPrice>
                        <StyledTopNavLinkRight title="Your account" to="account">
                            <Icon name="account" />
                            <span>{shortAddress}</span>
                        </StyledTopNavLinkRight>
                        <StyledAccount>
                            <AccountInfo account={this.props.userAccount} header="" hideTestId="true" />
                        </StyledAccount>
                    </StyledTopNavLi>
                    <StyledTopNavLi className="account">
                        <StyledTopNavLinkRight
                            title="Under the hood"
                            to="/under-the-hood"
                            data-testid="underTheHoodLink"
                        >
                            <Icon name="connect" />
                            <span>{this.props.web3Connect.network.name}</span>
                        </StyledTopNavLinkRight>
                    </StyledTopNavLi>
                </StyledTopNavUl>
            </StyledTopNav>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    rates: state.rates
});

export default connect(mapStateToProps)(TopNav);
