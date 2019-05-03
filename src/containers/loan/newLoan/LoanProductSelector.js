import React from "react";
import { connect } from "react-redux";
import LoanProductList from "containers/loan/components/LoanProductList";
import { Pgrid } from "components/PageLayout";
import Message from "components/augmint-ui/message";

import "./styles.css";

class LoanProductSelector extends React.Component {
    render() {
        return (
            <Pgrid id="loan-product-selector">
                <Pgrid.Row className="row">
                    <Pgrid.Column size={{ tablet: 1, desktop: 2 / 5 }} className="loan column left">
                        <LoanProductList products={this.props.loanProducts} header="Get a new A-EUR loan" />
                    </Pgrid.Column>
                    <Pgrid.Column className="loan column right" size={{ tablet: 1, desktop: 2 / 5 }}>
                        <Message info style={{ margin: 0 }}>
                            <p>
                                <strong>60% loan-to-value (LTV)</strong>
                            </p>
                            <p>You can get A-EUR for placing your ETH in escrow (collateral).</p>

                            <p>
                                <strong>Repayment</strong>
                                <br />
                                You get back all of your ETH if you repay your A-EUR loan anytime before it's due
                                (maturity).
                            </p>
                            <p>
                                <strong>Default (non payment)</strong>
                                <br />
                                If you decide not to repay the A-EUR loan at maturity then your ETH will be taken to the
                                Augmint system reserves.
                            </p>
                            <p>
                                If the value of your ETH (at the moment of collection) is higher than the A-EUR value of
                                your loan + fees for the default then the leftover ETH will be transfered back to your
                                ETH account.
                            </p>
                        </Message>
                    </Pgrid.Column>
                </Pgrid.Row>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    loanProducts: state.loanManager.products
});

export default connect(mapStateToProps)(LoanProductSelector);
