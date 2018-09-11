import React from "react";
import { connect } from "react-redux";
import store from "modules/store";
import { dismissTx } from "modules/reducers/submittedTransactions";

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
        this.toggleNotificationPanel = this.toggleNotificationPanel.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    componentDidMount() {
        augmintTokenProvider();
        ratesProvider();
    }

    toggleAccInfo(e, noScroll, isPropagate) {
        if (!isPropagate) {
            e.preventDefault();
        }
        this.props.toggleAccInfo();
        let fakebody = document.getElementById("fakebody");
        noScroll ? fakebody.classList.add("noScroll") : fakebody.classList.remove("noScroll");
    }

    toggleNotificationPanel(e) {
        e.preventDefault();
        this.props.toggleNotificationPanel();
    }

    handleClose(txHash) {
        store.dispatch(dismissTx(txHash, "dismiss"));
    }

    render() {
        const shortAddress = shortAccountAddresConverter(this.props.userAccount.address);
        const { ethBalance, tokenBalance } = this.props.userAccount;
        const transactions = this.props.transactions;
        const accountInfoData = {
            account: this.props.userAccount,
            rates: this.props.rates,
            web3Connect: this.props.web3Connect
        };

        let notiIcon = "";
        let _loading = false;
        let _style = {
            visibility: "hidden"
        };

        Object.keys(transactions).forEach(e => {
            if (transactions[e].event === "transactionHash" || "receipt") {
                notiIcon = "circle notched";
                _loading = true;
                _style = {
                    position: "relative",
                    visibility: "visible",
                    top: "-3px",
                    right: "-12px",
                    fontSize: "1.2rem",
                    height: "1.2rem",
                    width: "1.2rem",
                    color: "#276f86",
                    textShadow: "-2px 0 white, 0 2px white, 2px 0 white, 0 -2px white"
                };
            }
            if (transactions[e].event === "confirmation") {
                _loading = false;
                _style = {
                    visibility: "hidden"
                };
            }
            if (transactions[e].event === "error") {
                _loading = false;
                _style = {
                    visibility: "hidden"
                };
            }
        });

        return (
            <StyledTopNav className={this.props.showAccInfo ? this.props.className + " hidden" : this.props.className}>
                <TitleWrapper id="page-title" />
                <StyledTopNavUl>
                    <StyledTopNavLi>
                        <StyledPrice>
                            <span className="price">€/ETH {this.props.rates.info.ethFiatRate}</span>
                        </StyledPrice>
                    </StyledTopNavLi>
                    <StyledTopNavLi className={this.props.showAccInfo ? "navLinkRight" : "navLinkRight hidden"}>
                        <StyledTopNavLinkRight
                            title="Your account"
                            to={this.props.showAccInfo ? "" : "/account"}
                            onClick={e => this.toggleAccInfo(e, true)}
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
                        <StyledAccount className={this.props.showAccInfo ? "opened" : ""}>
                            <StyledAccountInfo
                                data={accountInfoData}
                                header=""
                                className={this.props.showAccInfo ? "opened" : ""}
                                toggleAccInfo={this.toggleAccInfo}
                            />
                            <CloseIcon
                                src={close}
                                onClick={e => this.toggleAccInfo(e)}
                                className={this.props.showAccInfo ? "opened" : ""}
                            />
                        </StyledAccount>
                    </StyledTopNavLi>
                    <StyledTopNavLi className={this.props.showAccInfo ? "navLinkRight" : "navLinkRight hidden"}>
                        <StyledTopNavLinkRight
                            title="Notifications"
                            to=""
                            onClick={e => {
                                this.toggleNotificationPanel(e);
                                if (this.props.showNotificationPanel) {
                                    this.handleClose();
                                }
                            }}
                            className={this.props.showNotificationPanel ? "notifications open" : "notifications"}
                        >
                            <Icon name="notifications" style={{ position: "relative", top: "11px" }} />
                            <Icon name={notiIcon} loading={_loading} style={_style} />
                        </StyledTopNavLinkRight>
                    </StyledTopNavLi>
                    <StyledTopNavLi className="navLinkRight">
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
    transactions: state.submittedTransactions.transactions,
    rates: state.rates
});

export default connect(mapStateToProps)(TopNav);
