import React from "react";
import { connect } from "react-redux";
import LoanProductList from "containers/loan/components/LoanProductList";
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
                        <p>
                            You can get UCD for placing your ETH in escrow
                            (collateral).{" "}
                        </p>
                        <p>
                            <strong>Repayment</strong>
                            <br />
                            When you repay the UCD on maturity you will get back
                            all of your ETH.
                        </p>
                        <p>
                            <strong>Default (non payment)</strong>
                            <br />
                            If you decide not to repay the UCD loan at maturity
                            then your ETH will be taken to the system (tokenUcd)
                            reserves.
                        </p>
                        <p>
                            TODO, Not yet implemented: <br />
                            If the value of your ETH (at the moment of
                            collection) is higher than the UCD value of your
                            loan + fees for the default then the leftover ETH
                            will be transfered back to your ETH account.
                        </p>
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
