/*
Wrapper for the whole App
    main navigation
*/
import "./site.css";
import "assets/fontawesome/css/fontawesome-all.css";

import "styles/global";

import React from "react";
import { connect } from "react-redux";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import ReactGA from "react-ga";
import store from "modules/store";
import { createGlobalStyle } from "styled-components";
import theme from "styles/theme";
import { media } from "styles/media";

import AccountHome from "containers/account";
import HowToGet from "containers/account/HowToGet";
import TransferPage from "containers/transfer";
import CreateTransferRequest from "containers/transfer/request/CreateTransferRequest";
import ShowTransferRequest from "containers/transfer/request/ShowTransferRequest";
import ExchangeHome from "containers/exchange";
import FundingHome from "containers/funding";
import LoanMain from "containers/loan";
import AugmintToken from "containers/augmintToken";
import Concept from "containers/home/concept";
import UnderTheHood from "containers/underthehood";
import NotConnectedHome from "containers/home/NotConnectedHome";
import Manifesto from "containers/manifesto/manifesto";
import Disclaimer from "containers/disclaimer/disclaimer";
import Roadmap from "containers/roadmap";
import Team from "containers/team";
import SiteMenu from "components/navigation";
import { PageNotFound } from "containers/PageNotFound";
import { AppFooter } from "containers/app/AppFooter";

import TopNav from "components/dashboard/containers/topNav";
import SideNav from "components/dashboard/components/sideNav";
import NetworkAlert from "components/dashboard/components/NetworkAlert";
import DisclaimerModal from "components/Disclaimer";
import { NotificationPanel } from "components/notifications";
import { dismissTx } from "modules/reducers/submittedTransactions";

import LockContainer from "containers/lock";
import EthereumTxStatus from "./EthereumTxStatus";
import LegacyTokens from "./LegacyTokens";
import LegacyExchanges from "./LegacyExchanges";
import LegacyLockers from "./LegacyLockers";
import LegacyLoanManagers from "./LegacyLoanManagers";
import TransferRequestAlert from "../transfer/request/TransferRequestAlert";

import { connectWeb3 } from "modules/web3Provider.js";

const GlobalStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css?family=Roboto:400,700|Roboto+Mono:400,700|Roboto+Slab:300,400');

    @keyframes icon-loading {
        0% {
            transform: rotate(0);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    body {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        min-width: 320px;
        background: ${theme.colors.primary};
        font-family: ${theme.typography.fontFamilies.default};
        color: ${theme.colors.white};
        font-smoothing: antialiased;
    }

    a {
    color: ${theme.colors.secondary};
    }

    a:hover {
    color: ${theme.colors.secondaryDark};
    }

    a,
    a:hover {
    text-decoration: none;
    }

    .hide-xs {
        ${media.tablet`
            display: none;
        `}
    }
    .show-xs {
        ${media.tabletMin`
            display: none;
        `}
    }
`;

class ScrollToTop extends React.Component {
    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            window.scrollTo(0, 0);
        }
    }

    render() {
        return this.props.children ? this.props.children : null;
    }
}

ScrollToTop = withRouter(ScrollToTop);

if (process.env.NODE_ENV === "production") {
    ReactGA.initialize("UA-113188857-1");
    ReactGA.pageview(window.location.pathname);
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.toggleAccInfo = this.toggleAccInfo.bind(this);
        this.toggleNotificationPanel = this.toggleNotificationPanel.bind(this);
        this.handleNotificationPanelClose = this.handleNotificationPanelClose.bind(this);
        this.state = {
            showMobileMenu: false,
            showAccInfo: false,
            showNotificationPanel: false
        };
    }

    toggleAccInfo() {
        this.setState({
            showAccInfo: !this.state.showAccInfo
        });
    }

    toggleMenu() {
        this.setState({
            showMobileMenu: !this.state.showMobileMenu
        });
    }

    toggleNotificationPanel() {
        this.setState({
            showNotificationPanel: !this.state.showNotificationPanel
        });
    }

    handleNotificationDismiss(txHash, dismissState) {
        store.dispatch(dismissTx(txHash, dismissState));
    }

    handleNotificationPanelClose(e) {
        if (this.state.showNotificationPanel === true && !e.target.closest("#NotificationPanel")) {
            this.toggleNotificationPanel();
            this.handleNotificationDismiss(undefined, "dismiss");
        }
    }

    componentDidMount() {
        this.props.history.listen((location, action) => {
            connectWeb3();
            this.setState(state => {
                return {
                    showMobileMenu: false
                };
            });
        });
    }

    render() {
        const mainPath =
            this.props.location.pathname.split("/").length > 0 ? this.props.location.pathname.split("/")[1] : "";

        const showConnection =
            [
                "account",
                "transfer",
                "exchange",
                "exchangeFiat",
                "loan",
                "stability",
                "lock",
                "loan",
                "how-to-get",
                "under-the-hood"
            ].indexOf(mainPath) > -1;

        console.log("network.id: ", this.props.web3Connect.network.id);

        return (
            <div className={showConnection ? "Site App" : "Site"} onClick={this.handleNotificationPanelClose}>
                {/*
                    REDIRECT urls with trailing slash to non trailing slash pathname
                */
                this.props.location.pathname.length > 1 &&
                    this.props.location.pathname.charAt(this.props.location.pathname.length - 1) === "/" && (
                        <Redirect
                            strict
                            exact
                            from={this.props.location.pathname}
                            to={this.props.location.pathname.substr(0, this.props.location.pathname.length - 1)}
                        />
                    )}
                <ScrollToTop />
                {showConnection && <DisclaimerModal />}
                <TopNav
                    web3Connect={this.props.web3Connect}
                    toggleAccInfo={this.toggleAccInfo}
                    toggleNotificationPanel={this.toggleNotificationPanel}
                    showAccInfo={this.state.showAccInfo}
                    showNotificationPanel={this.state.showNotificationPanel}
                    className={!showConnection && "hide"}
                />
                {!showConnection && (
                    <SiteMenu
                        className="site-menu"
                        web3Connect={this.props.web3Connect}
                        location={this.props.location}
                        showMenu={this.state.showMobileMenu}
                        toggleMenu={this.toggleMenu}
                    />
                )}
                {showConnection && (
                    <SideNav
                        showMenu={this.state.showMobileMenu}
                        toggleMenu={this.toggleMenu}
                        toggleNotificationPanel={this.toggleNotificationPanel}
                    />
                )}
                <div className={showConnection ? "Site-content App-content" : "Site-content"}>
                    {showConnection && (
                        <NotificationPanel
                            className={this.state.showNotificationPanel ? "notifications open" : "notifications"}
                            toggleNotificationPanel={this.toggleNotificationPanel}
                            showNotificationPanel={this.state.showNotificationPanel}
                            id={"NotificationPanel"}
                        >
                            <EthereumTxStatus
                                showNotificationPanel={this.state.showNotificationPanel}
                                toggleNotificationPanel={this.toggleNotificationPanel}
                            />
                        </NotificationPanel>
                    )}
                    {showConnection &&
                        !isNaN(this.props.web3Connect.network.id) &&
                        this.props.web3Connect.network.id !== 1 && (
                            <NetworkAlert network={this.props.web3Connect.network.name} className="banner" />
                        )}
                    {showConnection && ["stability", "under-the-hood"].indexOf(mainPath) < 0 && (
                        <div>
                            <LegacyLoanManagers />
                            <LegacyLockers />
                            <LegacyExchanges />
                            <LegacyTokens />
                            <TransferRequestAlert />
                        </div>
                    )}

                    <Switch>
                        <Route exact path="/" component={NotConnectedHome} />
                        <Route exact path="/account" component={AccountHome} />
                        <Route exact path="/transfer" component={TransferPage} />
                        <Route exact path="/transfer/request" component={CreateTransferRequest} />
                        <Route exact path="/transfer/:requestId" component={ShowTransferRequest} />
                        <Route exact path="/exchange" component={ExchangeHome} />
                        <Route exact path="/exchangeFiat" component={FundingHome} />
                        <Route exact path="/stability" component={AugmintToken} />
                        <Route exact path="/how-to-get" component={HowToGet} />
                        <Route path="/loan" component={LoanMain} />

                        <Route exact path="/concept" component={Concept} />
                        <Route exact path="/under-the-hood" component={UnderTheHood} />
                        <Route exact path="/manifesto" component={Manifesto} />
                        <Route exact path="/disclaimer" component={Disclaimer} />
                        <Route exact path="/roadmap" component={Roadmap} />
                        <Route exact path="/team" component={Team} />
                        <Route path="/lock" component={LockContainer} />
                        <Route component={PageNotFound} />
                    </Switch>
                </div>
                {showConnection ? null : (
                    <div className="Site-footer">
                        <AppFooter web3Connect={this.props.web3Connect} />
                    </div>
                )}
                <GlobalStyle />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect
});

export default (App = withRouter(connect(mapStateToProps)(App)));
