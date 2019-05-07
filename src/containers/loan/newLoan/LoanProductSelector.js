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
                        <Message info>
                            <p>
                                <strong>60% loan-to-value (LTV)</strong>
                                <br />
                                You can get A-EUR for placing your ETH in escrow (collateral).
                            </p>

                            <p>
                                <strong>Repayment</strong>
                                <br />
                                You get back all of your ETH if you repay your A-EUR loan anytime before it's due
                                (maturity).
                            </p>
                            <p>
                                <strong>Default (non payment)</strong>
                                <br />
                                If you don't repay your loan on maturity then the system will calculate the ETH
                                collateral required to cover your A-EUR repayment due. It will use the actual rates at
                                the moment of the collection executed.
                                <br />
                                If the value of your actual ETH is higher than the A-EUR value of your loan + fees for
                                the default then the leftover ETH will be transfered back to your ETH account.
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
