/*
Wrapper for the whole App
    main navigation
    Web3 & contracts initialisation
    Listeners and handlers to web3 events

TODO: consider moving event listeners  to a separate component
TODO: make REDUX connect (it messes up navigation) so that we don't need all of these store.getStates()
*/

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

import React from 'react';
import store from '../../store'
import watch from 'redux-watch'
import { setupWeb3 } from '../../modules/ethBase'
import { fetchUserBalance } from '../../modules/userBalances'
import { connectRates, refreshRates } from '../../modules/rates';
import { connectTokenUcd, refreshTokenUcd} from '../../modules/tokenUcd';
import { connectloanManager, refreshLoanManager} from '../../modules/loanManager';
import { fetchLoans } from '../../modules/loans'
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Route, Link, Switch } from 'react-router-dom';
import Home from '../home';
import GetLoan from '../getLoan';
import TokenUcd from '../tokenUcd';
import About from '../about';
import UnderTheHood from '../underthehood';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.handleLoad = this.handleLoad.bind(this);
        window.addEventListener('load', this.handleLoad);
    }

    handleLoad() {
        store.dispatch(setupWeb3()); // we do it on load event to avoid timing issues with injected web3

        let w1 = watch(store.getState, 'ethBase.web3ConnectionId')
        store.subscribe(w1((newVal, oldVal, objectPath) => {
            store.dispatch(connectRates());
            store.dispatch(connectTokenUcd());
            store.dispatch(connectloanManager());
        }))

        let w2 = watch(store.getState, 'rates.contract')
        store.subscribe(w2((newVal, oldVal, objectPath) => {
            if(newVal) {
                store.dispatch(refreshRates());
            }
        }))

        let w3 = watch(store.getState, 'tokenUcd.contract')
        store.subscribe(w3((newVal, oldVal, objectPath) => {
            if(newVal) {
                store.dispatch(refreshTokenUcd()); // tokenUCD refresh required for loanManager refresh
                // it's being called first by the listener
                //store.dispatch(fetchUserBalance(store.getState().ethBase.userAccount));
            }
        }))

        let w4 = watch(store.getState, 'loanManager.contract')
        store.subscribe(w4((newVal, oldVal, objectPath) => {
            if(newVal) {
                store.dispatch(refreshLoanManager());
                // it's being called first by the listener
                //store.dispatch(fetchLoans( store.getState().ethBase.userAccount));
                this.setupListeners();
            }
        }))
    }

    setupListeners() {
        let web3 = store.getState().ethBase.web3Instance;
        // TODO: think over UX how to display confirmed ("latest") and "pending" TXs
        //        Pending needed for quick UI refresh after tx submitted but we want to show when was it mined
        this.filterAllBlocks = web3.eth.filter("pending");
		this.filterAllBlocks.watch(this.onNewBlock.bind(this));

        let loanManager = store.getState().loanManager.contract.instance;
        // e_newLoan(uint8 productId, address borrower, address loanContract, uint disbursedLoanInUcd );
        loanManager.e_newLoan( {fromBlock: "latest", toBlock: "pending"}).watch(this.onNewLoan.bind(this));

        // TODO: add & handle loanproduct change events
    }

    onNewBlock() {
        console.debug("onNewBlock: dispatching fetchUserBalance & refreshTokenUcd");
        store.dispatch(refreshRates()); // not too expensive but should consider a  separate listener for rate change event
        store.dispatch(fetchUserBalance(store.getState().ethBase.userAccount));
        store.dispatch(refreshTokenUcd());

    }

    onNewLoan(error, result) {
        // TODO: add refresh LoanManager to update loanCount?
        let userAccount = store.getState().ethBase.userAccount
        if (result.args.borrower === userAccount) {
            console.debug("onNewLoan: loan for current user , dispatching fetchLoans")
            // TODO: it can be expensive, should create a separate fetchNewLoans action
            store.dispatch(fetchLoans( userAccount));
        }
    }

	componentWillUnmount() {
		this.filterAllBlocks.stopWatching();
        let loanManager = store.getState().loanManager.contract.instance;
        loanManager.e_newLoan().stopWatching();
	}

    componentWillReceiveProps(nextProps) {
        if (nextProps.isConnected && nextProps.userAccount !== this.props.userAccount ) {
            // TODO: this doesn't work yet: we need a timer to watch defaultAccount change
            // TODO handle this more generically (ie. watch all contract balances in ethBase, maybe cached? )
            store.dispatch(fetchUserBalance(nextProps.userAccount))
            // TODO: reset filters
        }
    }

    render() {
        return(
            <div>
                <header>
                    <Navbar inverse collapseOnSelect>
                        <Navbar.Header>
                            <Navbar.Brand>
                                <LinkContainer to="/">
                                    <Link to="/">UCD PoC</Link>
                                </LinkContainer>
                            </Navbar.Brand>
                            <Navbar.Toggle />
                        </Navbar.Header>
                        <Navbar.Collapse>
                            <Nav>
                                <LinkContainer to="/getLoan">
                                    <NavItem eventKey={1} href="/getLoan">Get UCD Loan</NavItem>
                                </LinkContainer>
                                <LinkContainer to="/tokenUcd">
                                    <NavItem eventKey={2} href="/tokenUcd">TokenUcd</NavItem>
                                </LinkContainer>

                            </Nav>
                            <Nav pullRight>
                                <LinkContainer to="/about-us">
                                    <NavItem eventKey={1} href="/about-us">About</NavItem>
                                </LinkContainer>
                                <LinkContainer to="/under-the-hood">
                                    <NavItem eventKey={2} href="/under-the-hood">Under the hood</NavItem>
                                </LinkContainer>
                            </Nav>
                        </Navbar.Collapse>
                    </Navbar>

                </header>

                <main>
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route exact path="/tokenUcd" component={TokenUcd} />
                        <Route path="/getLoan" component={GetLoan} />
                        <Route exact path="/about-us" component={About} />
                        <Route exact path="/under-the-hood" component={UnderTheHood} />
                    </Switch>
                </main>

            </div>
        )
    }
}

export default App
