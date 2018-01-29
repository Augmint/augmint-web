/*
Wrapper for the whole App
    main navigation
*/
import "semantic/dist/semantic.min.css";
import "./site.css";

import React from "react";
import { connect } from "react-redux";
import { Route, Switch, withRouter } from "react-router-dom";

import AccountHome from "containers/account";
import ExchangeHome from "containers/exchange";
import LoanMain from "containers/loan";
import AugmintToken from "containers/augmintToken";
import AboutUs from "containers/home/aboutUs";
import Concept from "containers/home/concept";
import TryIt from "containers/home/tryIt";
import UnderTheHood from "containers/underthehood";
import ConnectedHome from "containers/home/ConnectedHome";
import NotConnectedHome from "containers/home/NotConnectedHome/component";
import { PageNotFound } from "containers/PageNotFound";
import { AppMenu } from "containers/app/AppMenu";
import { AppFooter } from "containers/app/AppFooter";
import FlashMessages from "./FlashMessages";

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

class App extends React.Component {
    render() {
        const { isConnected } = this.props.web3Connect;
        return (
            <div className="Site">
                <ScrollToTop />
                <AppMenu web3Connect={this.props.web3Connect} location={this.props.location} />
                <FlashMessages />
                <div className="Site-content">
                    <Switch>
                        <Route exact path="/" component={isConnected ? ConnectedHome : NotConnectedHome} />
                        <Route exact path="/account" component={AccountHome} />
                        <Route exact path="/exchange" component={ExchangeHome} />
                        <Route exact path="/reserves" component={AugmintToken} />
                        <Route path="/loan" component={LoanMain} />

                        <Route exact path="/concept" component={Concept} />
                        <Route exact path="/tryit" component={TryIt} />
                        <Route exact path="/aboutus" component={AboutUs} />
                        <Route exact path="/under-the-hood" component={UnderTheHood} />
                        <Route component={PageNotFound} />
                    </Switch>
                </div>
                <div className="Site-footer">
                    <AppFooter />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect
});

export default (App = withRouter(connect(mapStateToProps)(App)));
