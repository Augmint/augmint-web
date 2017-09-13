/*
Wrapper for the whole App
    main navigation
    Web3 connection initialisation
*/
import "semantic/dist/semantic.min.css";
import "./site.css";

import React from "react";
import { connect } from "react-redux";
import store from "modules/store";
import { setupWeb3 } from "modules/reducers/web3Connect";
import { Route, Switch, withRouter } from "react-router-dom";

import AccountHome from "containers/account";
import ExchangeHome from "containers/exchange";
import LoanMain from "containers/loan";
import TokenUcd from "containers/tokenUcd";
import About from "containers/about";
import Concept from "containers/concept";
import UnderTheHood from "containers/underthehood";
import ConnectedHome from "containers/home/ConnectedHome";
import NotConnectedHome from "containers/home/NotConnectedHome";
import { PageNotFound } from "containers/PageNotFound";
import { AppMenu } from "containers/app/AppMenu";
//import { AppFooter } from "containers/app/AppFooter";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.onLoad = this.onLoad.bind(this);
        window.addEventListener("load", this.onLoad);
    }

    onLoad() {
        console.debug("App.onLoad() -  Dispatching setupWeb3()");
        store.dispatch(setupWeb3()); // we do it on load event to avoid timing issues with injected web3
    }

    render() {
        const { isConnected } = this.props.web3Connect;
        return (
            <div className="Site">
                <AppMenu
                    web3Connect={this.props.web3Connect}
                    location={this.props.location}
                />

                <div className="Site-content">
                    <Switch>
                        <Route
                            exact
                            path="/"
                            component={
                                isConnected ? ConnectedHome : NotConnectedHome
                            }
                        />
                        <Route exact path="/account" component={AccountHome} />
                        <Route
                            exact
                            path="/exchange"
                            component={ExchangeHome}
                        />
                        <Route exact path="/tokenUcd" component={TokenUcd} />
                        <Route path="/loan" component={LoanMain} />

                        <Route exact path="/concept" component={Concept} />
                        <Route exact path="/about-us" component={About} />
                        <Route
                            exact
                            path="/under-the-hood"
                            component={UnderTheHood}
                        />
                        <Route component={PageNotFound} />
                    </Switch>
                </div>
                {/* <div className="Site-footer">
                    <AppFooter />
                </div>  */}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect
});

export default (App = withRouter(connect(mapStateToProps)(App)));
