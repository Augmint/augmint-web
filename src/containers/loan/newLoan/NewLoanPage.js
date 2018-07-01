import React from "react";
import { connect } from "react-redux";
import { Pgrid } from "components/PageLayout";
import store from "modules/store";
import { ErrorPanel, LoadingPanel } from "components/MsgPanels";
import { SubmissionError } from "redux-form";
import { newLoan, LOANTRANSACTIONS_NEWLOAN_CREATED } from "modules/reducers/loanTransactions";
import NewLoanForm from "./NewLoanForm";
import NewLoanSuccess from "./NewLoanSuccess";

class NewLoanPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            products: props.loanManager.products,
            isLoading: true
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.products !== this.props.products) {
            this.setState({
                isLoading: false
            });
        }
    }

    componentDidMount() {
        this.setState({
            isLoading: false
        });
    }

    async handleSubmit(values) {
        // e.preventDefault(); // not needed with redux-form?
        // TODO: add productId to Form and change state ref here to values.prodcutId ?
        const res = await store.dispatch(newLoan(values.productId, values.ethAmount));
        if (res.type !== LOANTRANSACTIONS_NEWLOAN_CREATED) {
            throw new SubmissionError({
                _error: res.error
            });
        } else {
            this.setState({
                submitSucceeded: true,
                result: res.result
            });
            return res;
        }
    }

    render() {
        let msg;
        if (this.state.isLoading) {
            msg = <LoadingPanel>Fetching data...</LoadingPanel>;
        }
        if (msg) {
            return msg;
        }
        return (
            <Pgrid>
                <Pgrid.Row wrap={false}>
                    <Pgrid.Column>
                        {!this.state.submitSucceeded && (
                            <NewLoanForm
                                rates={this.props.rates}
                                loanManager={this.props.loanManager}
                                onSubmit={this.handleSubmit}
                            />
                        )}
                        {this.state.submitSucceeded && (
                            /* couldn't make this work yet:
                        <Redirect path="/getLoan/fetchLoansuccess" push component={fetchLoansuccess}/> */
                            <NewLoanSuccess result={this.state.result} />
                        )}
                    </Pgrid.Column>
                </Pgrid.Row>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    loanManager: state.loanManager,
    products: state.loanManager.products,
    rates: state.rates,
    userAccount: state.userBalances.account
});

export default connect(mapStateToProps)(NewLoanPage);
