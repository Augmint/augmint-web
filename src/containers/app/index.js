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
import watch from "redux-watch";
import { setupWeb3 } from "modules/reducers/web3Connect";
import { fetchUserBalance } from "modules/reducers/userBalances";
import {
    fetchTransferList,
    processTransfer
} from "modules/reducers/userTransfers";
import { connectRates, refreshRates } from "modules/reducers/rates";
import { connectTokenUcd, refreshTokenUcd } from "modules/reducers/tokenUcd";
import {
    connectloanManager,
    refreshLoanManager,
    fetchProducts
} from "modules/reducers/loanManager";
import { fetchLoans } from "modules/reducers/loans";
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
        store.dispatch(setupWeb3()); // we do it on load event to avoid timing issues with injected web3

        let w1 = watch(store.getState, "web3Connect.web3ConnectionId");
        store.subscribe(
            w1((newVal, oldVal, objectPath) => {
                store.dispatch(connectRates());
                store.dispatch(connectTokenUcd());
                store.dispatch(connectloanManager());
            })
        );

        let w2 = watch(store.getState, "rates.contract");
        store.subscribe(
            w2((newVal, oldVal, objectPath) => {
                if (newVal) {
                    store.dispatch(refreshRates());
                }
            })
        );

        let w3 = watch(store.getState, "tokenUcd.contract");
        store.subscribe(
            w3((newVal, oldVal, objectPath) => {
                if (newVal) {
                    store.dispatch(refreshTokenUcd()); // tokenUCD refresh required for loanManager refresh
                    // TODO: fetch latest n transactions only
                    store.dispatch(
                        fetchTransferList(this.props.userAccount, 0, "pending")
                    );
                    // it's being called first by the listener
                    //store.dispatch(fetchUserBalance(this.props.userAccount));
                }
            })
        );

        let w4 = watch(store.getState, "loanManager.contract");
        store.subscribe(
            w4((newVal, oldVal, objectPath) => {
                if (newVal) {
                    store.dispatch(refreshLoanManager());
                    store.dispatch(fetchProducts());
                    store.dispatch(fetchLoans(this.props.userAccount));
                    this.setupListeners();
                }
            })
        );
    }

    setupListeners() {
        let web3 = store.getState().web3Connect.web3Instance;
        // TODO: think over UX how to display confirmed ("latest") and "pending" TXs
        //        Pending needed for quick UI refresh after tx submitted but we want to show when was it mined
        this.filterAllBlocks = web3.eth.filter("pending");
        this.filterAllBlocks.watch(this.onNewBlock.bind(this));

        this.props.loanManager.instance
            .e_newLoan({ fromBlock: "latest", toBlock: "pending" })
            .watch(this.onNewLoan.bind(this));
        this.props.loanManager.instance
            .e_repayed({ fromBlock: "latest", toBlock: "pending" })
            .watch(this.onRepayed.bind(this));
        this.props.loanManager.instance
            .e_collected({ fromBlock: "latest", toBlock: "pending" })
            .watch(this.onCollected.bind(this));
        this.props.tokenUcd.instance
            .e_transfer({ fromBlock: "latest", toBlock: "pending" })
            .watch(this.onTransfer.bind(this));

        // TODO: add & handle loanproduct change events
    }

    onNewBlock() {
        console.debug(
            "onNewBlock: dispatching fetchUserBalance & refreshTokenUcd"
        );
        store.dispatch(refreshRates()); // not too expensive but should consider a  separate listener for rate change event
        store.dispatch(fetchUserBalance(this.props.userAccount));
        store.dispatch(refreshTokenUcd());
    }

    onNewLoan(error, result) {
        // event e_newLoan(uint8 productId, uint loanId, address borrower, address loanContract, uint disbursedLoanInUcd );
        console.debug("onNewLoan: dispatching refreshLoanManager");
        store.dispatch(refreshLoanManager()); // to update loanCount
        if (result.args.borrower === this.props.userAccount) {
            console.debug(
                "onNewLoan: new loan for current user. Dispatching fetchLoans"
            );
            // TODO: it can be expensive, should create a separate single fetchLoan action
            store.dispatch(fetchLoans(this.props.userAccount));
        }
    }

    onRepayed(error, result) {
        // e_repayed(loanContractAddress, loanContract.owner());
        if (result.args.borrower === this.props.userAccount) {
            console.debug(
                "onRepayed: loan repayed for current user. Dispatching fetchLoans"
            );
            // TODO: it can be expensive, should create a separate single fetchLoan action
            store.dispatch(fetchLoans(this.props.userAccount));
        }
    }

    onCollected(error, result) {
        // event e_collected(address borrower, address loanContractAddress);
        if (result.args.borrower === this.props.userAccount) {
            console.debug(
                "onCollected: loan collected for current user. Dispatching fetchLoans"
            );
            // TODO: it can be expensive, should create a separate single fetchLoan action
            store.dispatch(fetchLoans(this.props.userAccount));
        }
    }

    onTransfer(error, result) {
        if (
            result.args.from === this.props.userAccount ||
            result.args.to === this.props.userAccount
        ) {
            console.log(
                "onTransfer: e_transfer to or from for current userAccount. Dispatching processTransfer"
            );
            store.dispatch(processTransfer(this.props.userAccount, result));
        }
    }

    componentWillUnmount() {
        this.filterAllBlocks.stopWatching();
        this.props.loanManager.instance.e_newLoan().stopWatching();
        this.props.loanManager.instance.e_repayed().stopWatching();
        this.props.loanManager.instance.e_collected().stopWatching();
        this.props.tokenUcd.instance.e_transfer().stopWatching();
    }

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.isConnected &&
            nextProps.userAccount !== this.props.userAccount
        ) {
            // TODO: this doesn't work yet: we need a timer to watch defaultAccount change
            // TODO handle this more generically (ie. all contract balances watched and maybe cached? )
            store.dispatch(fetchUserBalance(nextProps.userAccount));
            // TODO: reset filters
        }
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
                                <small>
                                    on {this.props.network.name}
                                </small>
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
    tokenUcd: state.tokenUcd.contract
});

export default (App = withRouter(connect(mapStateToProps)(App)));
