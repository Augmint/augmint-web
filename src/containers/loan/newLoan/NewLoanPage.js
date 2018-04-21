import React from "react";
import { connect } from "react-redux";
import { Pgrid, Pblock } from "components/PageLayout";
import store from "modules/store";
import { ErrorPanel, LoadingPanel } from "components/MsgPanels";
import { SubmissionError } from "redux-form";
import { newLoan, LOANTRANSACTIONS_NEWLOAN_CREATED } from "modules/reducers/loanTransactions";
import LoanProductDetails from "containers/loan/components/LoanProductDetails";
import AccountInfo from "components/AccountInfo";
import NewLoanForm from "./NewLoanForm";
import NewLoanSuccess from "./NewLoanSuccess";

// TODO: push browser history on submit success (check: https://github.com/ReactTraining/react-router/issues/3903 )
//import { push } from 'react-router-redux'
//import { Route, Redirect } from 'react-router-dom';

class NewLoanPage extends React.Component {
    constructor(props) {
        super(props);
        const productId = this.props.match.params.loanProductId;
        this.state = {
            product: null,
            productId: productId,
            isLoading: true
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.products !== this.props.products) {
            this.setProduct(); // needed when landing from on URL directly
        }
    }

    componentDidMount() {
        this.setProduct(); // needed when landing from Link within App
    }

    setProduct() {
        // workaround b/c landing directly on URL and from LoanSelector triggers different events.
        if (this.props.products == null) {
            return;
        } // not loaded yet
        let isProductFound;
        let product = this.props.products[this.state.productId];
        if (typeof product === "undefined") {
            isProductFound = false;
        } else {
            isProductFound = true;
        }
        this.setState({
            isLoading: false,
            product: product,
            isProductFound: isProductFound
        });
    }

    async handleSubmit(values) {
        // e.preventDefault(); // not needed with redux-form?
        // TODO: add productId to Form and change state ref here to values.prodcutId ?
        const res = await store.dispatch(newLoan(this.state.productId, values.ethAmount));
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
            msg = <LoadingPanel>Fetching data (loan product id: {this.state.productId})...</LoadingPanel>;
        } else if (!this.state.isProductFound) {
            msg = <ErrorPanel>Can't find this loan product (loan product id: {this.state.productId}) </ErrorPanel>;
        } else if (!this.state.product.isActive) {
            msg = (
                <ErrorPanel>
                    This loan product is not active currently (loan product id: {this.state.productId}){" "}
                </ErrorPanel>
            );
        }

        if (msg) {
            return msg;
        }
        return (
            <Pgrid>
                <Pgrid.Row columns={2}>
                    <Pgrid.Column width={6}>
                        <Pblock
                            data-testid="selectedLoanProductBlock"
                            header={"Selected: loan product " + (this.state.product.id + 1)}
                        >
                            <LoanProductDetails product={this.state.product} />
                        </Pblock>
                        <AccountInfo account={this.props.userAccount} />
                    </Pgrid.Column>
                    <Pgrid.Column width={10}>
                        {!this.state.submitSucceeded && (
                            <NewLoanForm
                                product={this.state.product}
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
