import React from "react";
import { connect } from "react-redux";
import store from "modules/store";
import { Pblock, Psegment } from "components/PageLayout";
import { ArrayDump, stringify } from "./ArrayDump";
import { ContractBaseInfo } from "./ContractBaseInfo";
import loanManagerProvider from "modules/loanManagerProvider";
import { fetchAllLoans } from "modules/reducers/loans";
import { utils } from "@augmint/js";

class LoanManagerInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoaded: false, loanCounts: [], loanManagers: [], loanProducts: {}, loans: {} };
        this.handleRefreshClick = this.handleRefreshClick.bind(this);
    }

    async refresh() {
        const augmint = this.props.augmint;
        const isLoaded = true;
        const loanCounts = await augmint.getLoanCounts();
        const loanManagers = augmint.getAllLoanManagers();
        const loanProducts = new Map(
            await Promise.all(loanManagers.map(async m => [m.address, await m.getAllProducts()]))
        );
        const loans = new Map(await Promise.all(loanManagers.map(async m => [m.address, await m.getAllLoans()])));
        this.setState({ isLoaded, loanCounts, loanManagers, loanProducts, loans });
    }

    handleRefreshClick(e) {
        e.preventDefault();
        this.refresh();
    }

    componentDidMount() {
        loanManagerProvider();
        store.dispatch(fetchAllLoans());
        this.refresh();
    }

    render() {
        if (!this.state.isLoaded) {
            return <p>Loading...</p>;
        }

        const loanManagerAddresses = this.state.loanManagers.map(m => m.address);

        const activeProdCounts = utils.mapMap(this.state.loanProducts, val => val.filter(p => p.isActive).length);
        const disabledProdCounts = utils.mapMap(this.state.loanProducts, val => val.filter(p => !p.isActive).length);

        const loanCounts = utils.mapMap(this.state.loans, val => val.length);
        const repaidLoanCounts = utils.mapMap(this.state.loans, val => val.filter(l => l.isRepaid).length);
        const collectedLoanCounts = utils.mapMap(this.state.loans, val => val.filter(l => l.isCollected).length);
        const collectableLoanCounts = utils.mapMap(this.state.loans, val => val.filter(l => l.isCollectable).length);
        const repayableLoanCounts = utils.mapMap(this.state.loans, val => val.filter(l => l.isRepayable).length);

        const segments = loanManagerAddresses.map(m => (
            <Psegment key={m}>
                Address: {m}
                <br />
                ABI: ...
                <br />
                Products: {activeProdCounts.get(m)} active, {disabledProdCounts.get(m)} disabled
                <br />
                Loans: {loanCounts.get(m)} total, {repaidLoanCounts.get(m)} repaid, {collectedLoanCounts.get(m)}{" "}
                collected, {collectableLoanCounts.get(m)} collectable, {repayableLoanCounts.get(m)} repayable
            </Psegment>
        ));
        return <Pblock header="LoanManagers">{segments}</Pblock>;
    }
}

const mapStateToProps = state => ({
    augmint: state.web3Connect.augmint,
    allLoans: state.loans.allLoans
});

export default connect(mapStateToProps)(LoanManagerInfo);
