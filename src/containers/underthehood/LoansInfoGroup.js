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
            <Pgrid columns={3}>
                <Pgrid.Column>
                    <LoanManagerInfo contractData={this.props.loanManagerData} contract={this.props.loanManager} />
                </Pgrid.Column>
                <Pgrid.Column>
                    <ArrayDump header="Loan Products" items={this.props.loanProducts} />
                </Pgrid.Column>
                <Pgrid.Column>
                    <ArrayDump header="Loans for userAccount" items={this.props.loans} />
                </Pgrid.Column>
            </Pgrid>
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
