import React from "react";
import { connect } from "react-redux";

import augmintTokenProvider from "modules/augmintTokenProvider";
import ratesProvider from "modules/ratesProvider";

import Icon from "components/augmint-ui/icon";
import { shortAccountAddresConverter } from "utils/converter";
import { CloseIcon } from "./styles";
import close from "assets/images/close.svg";

import {
    StyledTopNav,
    TitleWrapper,
    StyledTopNavUl,
    StyledTopNavLi,
    StyledTopNavLinkRight,
    StyledPrice,
    StyledAccount,
    StyledSeparator,
    StyledAccountInfo
} from "./styles";

class TopNav extends React.Component {
    constructor(props) {
        super(props);
        this.toggleAccInfo = this.toggleAccInfo.bind(this);
    }

    componentDidMount() {
        augmintTokenProvider();
        ratesProvider();
    }

    toggleAccInfo(e) {
        e.preventDefault();
        e.stopPropagation();
        this.props.toggleAccInfo();
    }

    render() {
        const shortAddress = shortAccountAddresConverter(this.props.userAccount.address);
        const { ethBalance, tokenBalance } = this.props.userAccount;
        const accountInfoData = {
            account: this.props.userAccount,
            rates: this.props.rates,
            web3Connect: this.props.web3Connect
        };
        return (
            <StyledTopNav className={this.props.showAccInfo ? this.props.className + " hidden" : this.props.className}>
                <TitleWrapper id="page-title" />
                <StyledTopNavUl>
                    <StyledTopNavLi>
                        <StyledPrice>
                            <span className="price">€/ETH {this.props.rates.info.ethFiatRate}</span>
                        </StyledPrice>
                    </StyledTopNavLi>
                    <StyledTopNavLi className={this.props.showAccInfo ? "account" : "account hidden"}>
                        <StyledTopNavLinkRight
                            title="Your account"
                            to={this.props.showAccInfo ? "" : "/account"}
                            onTouchStart={this.toggleAccInfo}
                            onClick={this.toggleAccInfo}
                            className={this.props.showAccInfo ? "accountDetails opened" : "accountDetails"}
                        >
                            <Icon
                                name="account"
                                className={this.props.showAccInfo ? "accountIcon opened" : "accountIcon"}
                            />
                            <StyledPrice className="accountInfoContainer">
                                <span className="accountDetailsInfo">
                                    {ethBalance > 0 ? Number(ethBalance).toFixed(4) : 0} ETH
                                </span>
                            </StyledPrice>
                            <StyledSeparator />
                            <StyledPrice className="accountInfoContainer">
                                <span className="accountDetailsInfo">
                                    {tokenBalance > 0 ? Number(tokenBalance).toFixed(2) : 0} A€
                                </span>
                            </StyledPrice>
                            <StyledSeparator />
                            <StyledPrice className="accountInfoContainer">
                                <span className="accountDetailsInfo">{shortAddress}</span>
                            </StyledPrice>
                        </StyledTopNavLinkRight>
                        <StyledAccount>
                            <StyledAccountInfo
                                data={accountInfoData}
                                header=""
                                className={this.props.showAccInfo ? "opened" : ""}
                            />
                            <CloseIcon
                                src={close}
                                onTouchStart={this.toggleAccInfo}
                                onClick={this.toggleAccInfo}
                                className={this.props.showAccInfo ? "opened" : ""}
                            />
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
