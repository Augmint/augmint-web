import React from "react";
import { connect } from "react-redux";
import { Pgrid } from "components/PageLayout";
import { LoanManagerInfo } from "./components/LoanManagerInfo";
import { ArrayDump } from "./components/ArrayDump";
import loanManagerProvider from "modules/loanManagerProvider";

class LoansInfoGroup extends React.Component {
    componentDidMount() {
        loanManagerProvider();
    }

    render() {
        return (
            <Pgrid.Row>
                <Pgrid.Column size={{ phone: 1, tablet: 1, desktop: 1 / 2 }}>
                    <LoanManagerInfo contractData={this.props.loanManagerData} contract={this.props.loanManager} />
                    <ArrayDump header="Loans for userAccount" items={this.props.loans} />
                </Pgrid.Column>
                <Pgrid.Column size={{ phone: 1, tablet: 1, desktop: 1 / 2 }}>
                    <ArrayDump header="Loan Products" items={this.props.loanProducts} />
                </Pgrid.Column>
            </Pgrid.Row>
        );
    }
}

const mapStateToProps = state => ({
    loanManager: state.contracts.latest.loanManager,
    loanManagerData: state.loanManager,
    loanProducts: state.loanManager.products,
    loans: state.loans.loans
});

export default connect(mapStateToProps)(LoansInfoGroup);
