import React from "react";
import { connect } from "react-redux";
import LoanList from "containers/loan/components/LoanList";
import { Pgrid } from "components/PageLayout";
import { RepayHelp } from "./components/RepayHelp";

class LoanSelector extends React.Component {
    render() {
        return (
            <Pgrid.Row wrap={false}>
                <Pgrid.Column size={6 / 16}>
                    <RepayHelp />
                </Pgrid.Column>
                <Pgrid.Column size={10 / 16}>
                    <LoanList
                        header="Select your loan to repay"
                        noItemMessage={<p>None of your loans is due currently.</p>}
                        loans={this.props.loans}
                        filter={item => {
                            return item.isDue;
                        }}
                    />
                </Pgrid.Column>
            </Pgrid.Row>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    loans: state.loans.loans
});

export default connect(mapStateToProps)(LoanSelector);
