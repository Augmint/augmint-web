import React from "react";
import { connect } from "react-redux";
import LoanProductList from "../../../components/LoanProductList";
import { Well, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

export function SelectLoanButton(props) {
    return (
        <Link
            key={props.productId}
            className="btn btn-primary"
            to={`/loan/new/${props.productId}`}
        >
            Select
        </Link>
    );
}

class LoanProductSelector extends React.Component {
    render() {
        return (
            <Row>
                <Col xs={4} md={4}>
                    <Well>
                        You can get UCD for ETH collateral. <br />
                        When you repay the UCD on maturity you will get back all
                        of your ETH.<br />
                        If you decide not to repay the UCD loan then your ETH
                        will be taken to the UCD reserves.
                    </Well>
                </Col>
                <Col xs={8} md={8}>
                    <LoanProductList
                        products={this.props.loanProducts}
                        header={<h2>Select type of loan</h2>}
                        selectComponent={SelectLoanButton}
                        filter={item => {
                            return item.isActive;
                        }}
                    />
                </Col>
            </Row>
        );
    }
}

const mapStateToProps = state => ({
    loanProducts: state.loanManager.products
});

export default connect(mapStateToProps)(LoanProductSelector);
