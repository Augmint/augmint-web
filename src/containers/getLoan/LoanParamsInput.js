import React from 'react'
import { connect } from 'react-redux'
import LoanProductDetails from '../../components/LoanProductDetails'
import NewLoanForm from '../../components/NewLoanForm'
import {Grid, Row, Col} from 'react-bootstrap';

class LoanParamsForm extends React.Component {
    constructor(props) {
        super(props);
        let productId = this.props.match.params.loanProductId;
        let product = this.props.products ? this.props.products[productId] : null;
        this.state = {
            product: product, // workaround b/c  componentWillReceiveProps is not triggered when landing from LoanSelector
            productId: productId
        }
    }

    componentWillReceiveProps(nextProps)  {
        let product = nextProps.products ? nextProps.products[this.state.productId] : null;
        this.setState( {product: product});
    }

    handleSubmit(amount) {
        console.log("submit. amount:" , amount);
    }

    render() {
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
                            <h4>Selected Loan</h4>
                            <LoanProductDetails product={this.state.product} />
                        </Col>
                        <Col xs={8} md={8}>
                            <NewLoanForm product={this.state.product} rates={this.props.rates} onSuccess={this.handleSubmit}/>
                        </Col>
                    </Row>
                </Grid>
            )
        }
    }
}

const mapStateToProps = state => ({
    products: state.loanManager.products,
    rates: state.rates
})

export default connect(
    mapStateToProps
)(LoanParamsForm)
