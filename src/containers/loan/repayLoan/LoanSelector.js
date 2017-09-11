import React from "react";
import { connect } from "react-redux";
import LoanList from "containers/loan/components/LoanList";
import { Pgrid } from "components/PageLayout";
import { RepayHelp } from "./components/RepayHelp";

class LoanSelector extends React.Component {
    render() {
        return (
            <Pgrid columns={2}>
                <Pgrid.Column width={6}>
                    <RepayHelp />
                </Pgrid.Column>
                <Pgrid.Column width={10}>
                    <LoanList
                        header="Select your loan to repay"
                        noItemMessage={
                            <p>None of your loans is due currently.</p>
                        }
                        loans={this.props.loans}
                        filter={item => {
                            return item.isDue;
                        }}
                    />
                </Pgrid.Column>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    loans: state.loans.loans
});

export default connect(mapStateToProps)(LoanSelector);
