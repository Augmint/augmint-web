import React from 'react'
import { connect } from 'react-redux'
import {Grid, Row, Col} from 'react-bootstrap';
import store from '../../store'
import { SubmissionError } from 'redux-form'
import { newLoan, LOANMANAGER_NEWLOAN_ERROR} from '../../modules/loanManager'
import LoanProductDetails from '../../components/LoanProductDetails'
import AccountInfo from '../../components/AccountInfo'
import NewLoanForm from './NewLoanForm'
import NewLoanSuccess from './NewLoanSuccess';

// TODO: push browser history on submit success (check: https://github.com/ReactTraining/react-router/issues/3903 )
//import { push } from 'react-router-redux'
//import { Route, Redirect } from 'react-router-dom';

class NewLoanPage extends React.Component {
    constructor(props) {
        super(props);
        let productId = this.props.match.params.loanProductId;
        let product = this.props.products ? this.props.products[productId] : null;
        this.state = {
            product: product, // workaround b/c  componentWillReceiveProps is not triggered when landing from LoanSelector
            productId: productId
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps)  {
        let product = nextProps.products ? nextProps.products[this.state.productId] : null;
        this.setState( {product: product});
    }

    async handleSubmit(values) {
        // e.preventDefault(); // not needed with redux-form?
        // TODO: add productId to Form and change state ref here to values.prodcutId ?
        let res = await store.dispatch(newLoan(this.state.productId, values.ethAmount));
        if( res.type === LOANMANAGER_NEWLOAN_ERROR) {
            throw new SubmissionError({
              _error: { title: 'Ethereum transaction Failed', details: res.error}
            })
        } else {
            this.setState({submitSucceeded: true, loanCreated: res.loanCreated });
            // this causing weird behavour:
            // store.dispatch(push('/getLoan/fetchLoansuccess', { loanCreated: res.loanCreated}));
            //this just doesnt upted browser URL:
            // store.history.push('/getLoan/fetchLoansuccess', { submitSucceeded: true, loanCreated: res.loanCreated })
            return res;
        }
    }

    render() {
        //const {submitSucceeded } = this.state

        switch (this.state.product) {
            case null:
            return (
                <p>Fetching data (loan product id: {this.state.productId})...</p>
            )

            case -1:
            return (
                <p>Can't find this loan product (loan product id: {this.state.productId}) </p>
            )

            case -2:
            return (
                <p>This loan product is not active currently (loan product id: {this.state.productId}) </p>
            )

            default:
            return(
                <Grid>
                    <Row>
                        <Col xs={4} md={4}>
                            <Row>
                                <Col>
                                    <h4>Selected Loan</h4>
                                    <LoanProductDetails product={this.state.product} />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <AccountInfo title={<h2>My Account</h2>} account={this.props.userAccount}/>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={8} md={8}>
                            {!this.state.submitSucceeded &&
                                <NewLoanForm product={this.state.product} rates={this.props.rates}
                                    onSubmit={this.handleSubmit}/>
                            }
                            {this.state.submitSucceeded &&
                                /* couldn't make this work yet:
                                <Redirect path="/getLoan/fetchLoansuccess" push component={fetchLoansuccess}/> */
                                <NewLoanSuccess loanCreated={this.state.loanCreated} />
                            }
                        </Col>
                    </Row>
                </Grid>
            )
        }
    }
}

const mapStateToProps = state => ({
    products: state.loanManager.products,
    rates: state.rates,
    submitSucceeded: state.submitSucceeded,
    userAccount: state.userBalances.account
})

export default connect(
    mapStateToProps
)(NewLoanPage)
