/*
Wrapper for the whole App
    main navigation
*/
import "semantic/dist/semantic.min.css";
import "./site.css";
import "assets/fontawesome/css/fontawesome-all.css";

import "styles/global";

import React from "react";
import { connect } from "react-redux";
import { Route, Switch, withRouter } from "react-router-dom";
import ReactGA from "react-ga";

import AccountHome from "containers/account";
import ExchangeHome from "containers/exchange";
import LoanMain from "containers/loan";
import AugmintToken from "containers/augmintToken";
import Concept from "containers/home/concept";
import TryIt from "containers/home/tryIt";
import UnderTheHood from "containers/underthehood";
import NotConnectedHome from "containers/home/NotConnectedHome";
import Contact from "containers/contact/contact";
import Manifesto from "containers/manifesto/manifesto";
import Disclaimer from "containers/disclaimer/disclaimer";
import Roadmap from "containers/roadmap";
import AppMenu from "components/navigation";
import { PageNotFound } from "containers/PageNotFound";
import { AppFooter } from "containers/app/AppFooter";

import LockContainer from "containers/lock";
import EthereumTxStatus from "./EthereumTxStatus";
import LegacyTokens from "./LegacyTokens";
import LegacyExchanges from "./LegacyExchanges";

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
        this.state = {
            showMobileMenu: false
        };
    }
    toggleMenu() {
        this.setState({
            showMobileMenu: !this.state.showMobileMenu
        });
    }
    componentDidMount() {
        this.props.history.listen((location, action) => {
            this.setState(state => {
                return {
                    showMobileMenu: false
                };
            });
        });
    }

    render() {
        return (
            <div className="Site">
                <ScrollToTop />
                <AppMenu
                    web3Connect={this.props.web3Connect}
                    location={this.props.location}
                    showMenu={this.state.showMobileMenu}
                    toggleMenu={this.toggleMenu}
                />

                <EthereumTxStatus />

                <LegacyTokens />

                <LegacyExchanges />

                <div className="Site-content">
                    <Switch>
                        <Route exact path="/" component={NotConnectedHome} />
                        <Route exact path="/account" component={AccountHome} />
                        <Route exact path="/exchange" component={ExchangeHome} />
                        <Route exact path="/reserves" component={AugmintToken} />
                        <Route path="/loan" component={LoanMain} />

                        <Route exact path="/concept" component={Concept} />
                        <Route exact path="/tryit" component={TryIt} />
                        <Route exact path="/under-the-hood" component={UnderTheHood} />
                        <Route exact path="/contact" component={Contact} />
                        <Route exact path="/manifesto" component={Manifesto} />
                        <Route exact path="/disclaimer" component={Disclaimer} />
                        <Route exact path="/roadmap" component={Roadmap} />
                        <Route exact path="/lock" component={LockContainer} />
                        <Route component={PageNotFound} />
                    </Switch>
                </div>
                <div className="Site-footer">
                    <AppFooter web3Connect={this.props.web3Connect} />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect
});

export default (App = withRouter(connect(mapStateToProps)(App)));
