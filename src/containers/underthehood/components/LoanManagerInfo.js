import React from "react";
import { connect } from "react-redux";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { utils } from "@augmint/js";
import { Pblock, Psegment } from "components/PageLayout";
import Button from "components/augmint-ui/button";
import userBalances from "modules/reducers/userBalances";
import legacyBalances from "modules/reducers/legacyBalances";

const blockHeaderStyle = { fontSize: "1.5em", fontWeight: 300 };

class LoanManagerInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoaded: false, loanManagers: [], tokenAdresses: {}, loanProducts: {}, loans: {} };
        this.handleRefreshClick = this.handleRefreshClick.bind(this);
    }

    async refresh() {
        const augmint = this.props.augmint;
        const isLoaded = true;
        const loanManagers = (augmint && augmint.getAllLoanManagers()) || [];
        const tokenAddresses = new Map(
            await Promise.all(loanManagers.map(async m => [m.address, await m.augmintTokenAddress]))
        );
        const loanProducts = new Map(
            await Promise.all(loanManagers.map(async m => [m.address, await m.getAllProducts()]))
        );
        const loans = new Map(await Promise.all(loanManagers.map(async m => [m.address, await m.getAllLoans()])));
        this.setState({ isLoaded, loanManagers, tokenAddresses, loanProducts, loans });
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
        if (!this.props.augmint) {
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
                this.props.augmint.deployedEnvironment.getAbiHash("LoanManager", m.address)
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
                Products: {activeProdCounts.get(m)} active, {disabledProdCounts.get(m)} disabled
                <br />
                Loans: {loanCounts.get(m)} total, {repaidLoanCounts.get(m)} repaid, {collectedLoanCounts.get(m)}{" "}
                collected, {collectableLoanCounts.get(m)} collectable, {repayableLoanCounts.get(m)} repayable
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
    augmint: state.web3Connect.augmint,
    allLoans: state.loans.allLoans
});

export default connect(mapStateToProps)(LoanManagerInfo);
