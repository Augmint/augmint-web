/*
Wrapper for the whole App
    main navigation
    Web3 & contracts initialisation
    Listeners and handlers to web3 events

TODO: consider moving connection, event listeners etc to separate modul (like exchangeProvider)
*/

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/css/bootstrap-theme.css";

import React from "react";
import { connect } from "react-redux";
import store from "modules/store";
import { setupWeb3 } from "modules/reducers/web3Connect";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Route, Link, Switch, withRouter } from "react-router-dom";
import Home from "containers/home";
import AccountHome from "containers/account";
import ExchangeHome from "containers/exchange";
import LoanMain from "containers/loan";
import TokenUcd from "containers/tokenUcd";
import About from "containers/about";
import UnderTheHood from "containers/underthehood";
import { PageNotFound } from "containers/PageNotFound";
import { EthereumState } from "./EthereumState";

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
        return (
            <div>
                <header>
                    <Navbar inverse collapseOnSelect>
                        <Navbar.Header>
                            <Navbar.Brand>
                                <LinkContainer to="/">
                                    <Link to="/">Home</Link>
                                </LinkContainer>
                            </Navbar.Brand>
                            <Navbar.Toggle />
                        </Navbar.Header>
                        <Navbar.Collapse>
                            <Nav>
                                <LinkContainer to="/account">
                                    <NavItem eventKey={1} href="/account">
                                        My Account
                                    </NavItem>
                                </LinkContainer>
                                <LinkContainer to="/exchange">
                                    <NavItem eventKey={2} href="/exchange">
                                        Buy/Sell UCD
                                    </NavItem>
                                </LinkContainer>
                                <LinkContainer to="/loan/new">
                                    <NavItem eventKey={3} href="/loan/new">
                                        Get UCD Loan
                                    </NavItem>
                                </LinkContainer>
                                <LinkContainer to="/tokenUcd">
                                    <NavItem eventKey={4} href="/tokenUcd">
                                        TokenUcd
                                    </NavItem>
                                </LinkContainer>
                            </Nav>
                            <Navbar.Text pullRight>
                                <small>on {this.props.network.name}</small>
                            </Navbar.Text>;
                            <Nav pullRight>
                                <LinkContainer to="/about-us">
                                    <NavItem eventKey={1} href="/about-us">
                                        About
                                    </NavItem>
                                </LinkContainer>
                                <LinkContainer to="/under-the-hood">
                                    <NavItem
                                        eventKey={2}
                                        href="/under-the-hood"
                                    >
                                        Under the hood
                                    </NavItem>
                                </LinkContainer>
                            </Nav>
                        </Navbar.Collapse>
                    </Navbar>
                </header>

                <main>
                    <EthereumState />
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route exact path="/account" component={AccountHome} />
                        <Route
                            exact
                            path="/exchange"
                            component={ExchangeHome}
                        />
                        <Route exact path="/tokenUcd" component={TokenUcd} />
                        <Route path="/loan" component={LoanMain} />
                        <Route exact path="/about-us" component={About} />
                        <Route
                            exact
                            path="/under-the-hood"
                            component={UnderTheHood}
                        />
                        <Route component={PageNotFound} />
                    </Switch>
                </main>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    network: state.web3Connect.network,
    userAccount: state.web3Connect.userAccount,
    loanManager: state.loanManager.contract,
    tokenUcd: state.tokenUcd.contract,
    rates: state.rates.contract
});

export default (App = withRouter(connect(mapStateToProps)(App)));
