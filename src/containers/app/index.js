import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

import React from 'react';
import store from '../../store'
import watch from 'redux-watch'
import { setupWeb3, refreshBalance } from '../../modules/ethBase'
import { connectRates, refreshRates } from '../../modules/rates';
import { connectTokenUcd, refreshTokenUcd} from '../../modules/tokenUcd';
import { connectloanManager, refreshLoanManager} from '../../modules/loanManager';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Route, Link, Switch } from 'react-router-dom';
import Home from '../home';
import GetLoan from '../getLoan';
import TokenUcd from '../tokenUcd';
import About from '../about';
import UnderTheHood from '../underthehood';
import StatusMessages from './StatusMessages'

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
            store.dispatch(refreshBalance(store.getState().ethBase.userAccount));
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
                store.dispatch(refreshTokenUcd());
            }
        }))

        let w4 = watch(store.getState, 'loanManager.contract')
        store.subscribe(w4((newVal, oldVal, objectPath) => {
            if(newVal) {
                store.dispatch(refreshLoanManager());
            }
        }))
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isConnected && nextProps.userAccount !== this.props.userAccount ) {
            // TODO: this doesn't work yet: we need a timer to watch defaultAccount change
            // TODO handle this more generically (ie. watch all contract balances in ethBase, maybe cached? )
            refreshBalance(nextProps.userAccount)
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
                    <StatusMessages />
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
