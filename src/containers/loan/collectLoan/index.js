import React from "react";
import { connect } from "react-redux";
import store from "modules/store";
import LoanList from "containers/loan/components/LoanList";
import { Psegment, Pheader, Pgrid } from "components/PageLayout";
import { Message } from "semantic-ui-react";

import { fetchLoansToCollect } from "modules/reducers/loanManager";
import CollectLoanButton from "./CollectLoanButton";

class CollectLoanMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loansToCollect: null
        };
    }

    componentDidMount() {
        // needed when landing from Link within App
        if (this.props.loanManager) {
            store.dispatch(fetchLoansToCollect());
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.loanManager && prevProps.loanManager !== this.props.loanManager) {
            // loanManager mounted
            store.dispatch(fetchLoansToCollect());
        }
    }

    render() {
        const { loansToCollect } = this.props;
        return (
            <Psegment>
                <Pheader header="Collect loans" />
                <Pgrid>
                    <Pgrid.Column width={6}>
                        <Message info>
                            <p>
                                When collecting a defaulted (not paid on time) loan the ETH held in contract escrow
                                (collateral) will be transfered to system reserves.{" "}
                            </p>
                            <p>
                                TODO, Not yet implemented: <br />
                                If the value of the ETH collateral (at the moment of collection) is higher than the ACE
                                loan amount less the fees for the collection then the leftover ETH will be transfered
                                back to the borrower's ETH account.
                            </p>
                        </Message>
                    </Pgrid.Column>
                    <Pgrid.Column width={10}>
                        <CollectLoanButton
                            loansToCollect={loansToCollect}
                            onSuccess={() => store.dispatch(fetchLoansToCollect())}
                        />
                        <LoanList
                            header="Loans to collect"
                            noItemMessage={<p>No defaulted and uncollected loan.</p>}
                            loans={loansToCollect}
                        />
                    </Pgrid.Column>
                </Pgrid>
            </Psegment>
        );
    }
}

const mapStateToProps = state => ({
    loansToCollect: state.loanManager.loansToCollect,
    loanManager: state.loanManager.contract,
    isLoading: state.loanManager.isLoading
});

export default (CollectLoanMain = connect(mapStateToProps)(CollectLoanMain));
