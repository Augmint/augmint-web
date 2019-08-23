import React from "react";
import { connect } from "react-redux";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { utils, Tokens, Wei } from "@augmint/js";
import { Pblock, Psegment } from "components/PageLayout";
import Button from "components/augmint-ui/button";

const blockHeaderStyle = { fontSize: "1.5em", fontWeight: 300 };

class LoanManagerInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            loanManagers: [],
            tokenAdresses: {},
            loanProducts: {},
            loans: {},
            ethBalances: {}
        };
        this.handleRefreshClick = this.handleRefreshClick.bind(this);
    }

    async refresh() {
        const augmint = this.props.web3Connect.augmint;
        const isLoaded = true;
        const loanManagers = (augmint && augmint.getAllLoanManagers()) || [];
        const tokenAddresses = new Map(
            await Promise.all(loanManagers.map(async m => [m.address, await m.augmintTokenAddress]))
        );
        const loanProducts = new Map(
            await Promise.all(loanManagers.map(async m => [m.address, await m.getAllProducts()]))
        );
        const loans = new Map(await Promise.all(loanManagers.map(async m => [m.address, await m.getAllLoans()])));

        const web3 = this.props.web3Connect.web3Instance;
        const ethBalances = new Map(
            await Promise.all(loanManagers.map(async m => [m.address, Wei.parse(await web3.eth.getBalance(m.address))]))
        );

        this.setState({ isLoaded, loanManagers, tokenAddresses, loanProducts, loans, ethBalances });
    }

    handleRefreshClick(e) {
        e.preventDefault();
        this.refresh();
    }

    componentDidMount() {
        this.refresh();
    }

    render() {
        if (!this.state.isLoaded) {
            return (
                <Pblock header="LoanManagers" headerStyle={blockHeaderStyle}>
                    <p>Loading...</p>
                </Pblock>
            );
        }
        if (!this.props.web3Connect || !this.props.web3Connect.augmint) {
            return (
                <Pblock header="LoanManagers" headerStyle={blockHeaderStyle}>
                    <p>Error: No augmint environment</p>
                </Pblock>
            );
        }
        if (this.state.loanManagers.length === 0) {
            return (
                <Pblock header="LoanManagers" headerStyle={blockHeaderStyle}>
                    <p>Error: No loanmanagers</p>
                </Pblock>
            );
        }

        const loanManagerAddresses = this.state.loanManagers.map(m => m.address);
        const abiHashes = new Map(
            this.state.loanManagers.map(m => [
                m.address,
                this.props.web3Connect.augmint.deployedEnvironment.getAbiHash("LoanManager", m.address)
            ])
        );
        const abis = new Map(this.state.loanManagers.map(m => [m.address, m.instance._jsonInterface]));

        const activeProdCounts = countOf(this.state.loanProducts, prod => prod.isActive);
        const disabledProdCounts = countOf(this.state.loanProducts, prod => !prod.isActive);

        const loanCounts = countOf(this.state.loans, loan => true);
        const repaidLoanCounts = countOf(this.state.loans, loan => loan.isRepaid);
        const collectedLoanCounts = countOf(this.state.loans, loan => loan.isCollected);
        const collectableLoanCounts = countOf(this.state.loans, loan => loan.isCollectable);
        const repayableLoanCounts = countOf(this.state.loans, loan => loan.isRepayable);

        const segments = loanManagerAddresses.map(m => (
            <Psegment key={m}>
                Address: <strong>{m}</strong>
                <br />
                <br />
                Products: {activeProdCounts.get(m)} active, {disabledProdCounts.get(m)} disabled
                <br />
                Loans: {loanCounts.get(m)} total, {repaidLoanCounts.get(m)} repaid, {collectedLoanCounts.get(m)}{" "}
                collected, {collectableLoanCounts.get(m)} collectable, {repayableLoanCounts.get(m)} repayable
                <br />
                ETH balance:{" "}
                <strong>
                    {this.state.ethBalances
                        .get(m)
                        .toNumber()
                        .toFixed(6) + " ETH"}
                </strong>
                {" (" + this.state.ethBalances.get(m).toString() + " wei)"}
                <br />
                <br />
                Token: <strong>{this.state.tokenAddresses.get(m)}</strong>
                <br />
                ABI hash: <strong>{abiHashes.get(m)}</strong>
                <br />
                <CopyToClipboard
                    text={JSON.stringify(abis.get(m), null, 2)}
                    onCopy={() => alert(`ABI ${abiHashes.get(m)} copied to clipboard`)}
                >
                    <Button size="small">Copy ABI to clipboard</Button>
                </CopyToClipboard>
            </Psegment>
        ));
        segments.push(
            <Button key="refresh" size="small" onClick={this.handleRefreshClick}>
                Refresh
            </Button>
        );

        return (
            <Pblock header="LoanManagers" headerStyle={blockHeaderStyle}>
                {segments}
            </Pblock>
        );
    }
}

const countOf = (map, filter) => utils.mapMap(map, val => val.filter(filter).length);

const mapStateToProps = state => ({
    web3Connect: state.web3Connect
});

export default connect(mapStateToProps)(LoanManagerInfo);
