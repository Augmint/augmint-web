import React from 'react';
import {render} from 'react-dom';
require('../index.html'); // for index.html hot reload
import {Bootstrap, Button, ButtonToolbar, PageHeader, Grid, Row, Col} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import { default as Web3} from 'web3';
import { default as Contract } from 'truffle-contract';
import rates_artifacts from '../../build/contracts/Rates.json';
import tokenucd_artifacts from '../../build/contracts/TokenUcd.json';
import loanmanager_artifacts from '../../build/contracts/LoanManager.json';
import ethbackedloan_artifacts from '../../build/contracts/EthBackedLoan.json';

// TODO: add react-hot-loader: https://gaearon.github.io/react-hot-loader/getstarted/
function PageWrapper(props) {
    return (
        <div className="PageWrapper">
            <PageHeader>
                US Crypto Dollar <small>Proof of Concept playground</small>
            </PageHeader>
            {props.children}
        </div>
    );
}

var web3; // TODO: move this from global

class SolidityContract {
        constructor (instance){
            this.instance = instance;
        }

        static async connectNew(provider, artifacts) {
            var contractDef = Contract(artifacts);
            contractDef.setProvider(provider);
            var instance = await contractDef.deployed();
            // TODO: check if this contract exists (ie. deployed() doesn't return error when contract is not deployed)
            return new SolidityContract(instance) ;
        }
}

export class Address extends React.Component {
    // accepts an address or a SolidityContract
    constructor(props) {
        super(props);
        this.state = { address: '[none]' };
    }

    async componentDidUpdate (prevProps, prevState) {
        if (prevProps.item !== this.props.item) {
            this.updateState();
        }
    }

    async updateState() {
        var addr;

    	if (typeof this.props.item == 'string') {
    		addr = this.props.item;
    	} else if ( this.props.item instanceof SolidityContract ) {
            addr = this.props.item.instance.address;
        } else {
    		addr = '[none]';
    	}

        this.setState({
            address: addr
        });
    }

    render() {
        return <span className="_account">{this.state.address} </span>;
    }
};

export class Balance extends React.Component {
    // accepts an address or a SolidityContract
	constructor(props) {
		super(props);
		this.state = { balance: '[none]' };
	}

    async componentDidUpdate (prevProps, prevState) {
        if (prevProps.item !== this.props.item) {
            this.updateState();
        }
    }

	async updateState() {
        var addr, bal;

        if (typeof this.props.item == 'string') {
            addr = this.props.item;
            bal =  web3.fromWei(await web3.eth.getBalance(addr).toNumber());
        } else if ( this.props.item instanceof SolidityContract) {
            addr = this.props.item.instance.address;
            bal = web3.fromWei(await web3.eth.getBalance(addr).toNumber());
        } else {
            bal = '[none]';
        }

		this.setState({
			balance: bal
		});
	}

	componentWillMount() {
		this.filter = web3.eth.filter("latest"); // TODO: filter for balance change events on this acc only
		this.filter.watch(this.updateState.bind(this));
	}

	componentWillUnmount() {
		this.filter.stopWatching();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.address !== this.props.address) {
			this.componentWillUnmount();
			this.componentWillMount();
		}
	}

	render() { return <span className="_balance">{this.state.balance} ETH</span>; }
}


export class Rates extends React.Component {
    constructor(props) {
        super(props);
        this.refreshRates = this.refreshRates.bind(this);
        this.state = {};
    }

    async componentDidUpdate(prevProps, prevState) {
        // console.debug("Rates.componentDidUpdate", "willRefresh:", prevProps.contract !== this.props.contract);
        if (prevProps.contract !== this.props.contract) {
            this.refreshRates();
        }
    }

    async refreshRates() {
        // console.debug("Rates.refreshRates", "will reread (when props.contract != null):", this.props.contract != null);
        if( this.props.contract != null) {
            var usdWeiRate = (await this.props.contract.instance.usdWeiRate()).toNumber();
            this.setState({
                usdWeiRate: usdWeiRate,
                usdEthRate: web3.fromWei(usdWeiRate),
                ethUsdRate: 1 / web3.fromWei(usdWeiRate)
            });
        }
    }

    render() {
        // console.debug("Rates.render");
        return(
            <div>
                <p>USD/ETH: { Math.round( this.state.usdEthRate * 100000000) / 100000000 }</p>
                <p>ETH/USD: { Math.round( this.state.ethUsdRate * 10000) / 10000 }</p>
                <Button onClick={this.refreshRates}>Refresh rates</Button>
             </div>
        );
    }
}

class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {};
        // TODO: check web3 properly for all scenarios on allnetworks (metamask vs. mist vs. localhost)
        if (typeof web3 !== 'undefined') {
            web3 = new Web3(web3.currentProvider);
        } else {
            // set the provider you want from Web3.providers
            web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }
        // interval check is required to detect when user changes account in metamask
        //      TODO: it doesn't seem to work with Metamask, account change not detected
        //      setInterval(this.checkAccounts.bind(this), 500);
        this.checkAccounts();
        // TODO: error handling: https://facebook.github.io/react/blog/2017/07/26/error-handling-in-react-16.html
        this.connectContracts();
    }

	async checkAccounts() {
		web3.eth.getAccounts( (error, accounts) => {
            if (error) { // TODO: proper error handling
                throw error;
            }
            // TODO: could we use web3.eth.defaultAccount?
    		if ( accounts[0] != this.state.userAccount) {
    			this.setState({
    				userAccount: accounts[0],
                    accounts: accounts
    			});
    		}
        });
	}

    async connectContracts() {
        // TODO: handle network change in Metamask
        // TODO: handle fail separetly for each contract
        this.setState({
            rates: await SolidityContract.connectNew(web3.currentProvider, rates_artifacts),
            tokenUcd: await SolidityContract.connectNew(web3.currentProvider, tokenucd_artifacts),
            loanManager: await SolidityContract.connectNew(web3.currentProvider, loanmanager_artifacts)
        });
    }

    render () {
        return (
            <PageWrapper>
                <div>
                    <p>Hello UCD! </p>
                    <p>Rates address: <Address item={this.state.rates} /> </p>
                    <p>LoanManager address: <Address item={this.state.loanManager} /> </p>
                    <p>TokenUcd address: <Address item={this.state.tokenUcd} />
                            <Balance item={this.state.tokenUcd} />
                    </p>
                    <p>User account: <Address item={this.state.userAccount} />
                        <Balance item={this.state.userAccount} />
                    </p>
                </div>
                <Rates contract={this.state.rates}/>
            </PageWrapper>
        );
    }
}

render(<App/>, document.getElementById('app'));
