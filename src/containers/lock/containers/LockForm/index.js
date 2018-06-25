import React from "react";
import store from "modules/store";
import { connect } from "react-redux";

import { newLock, LOCKTRANSACTIONS_NEWLOCK_CREATED } from "modules/reducers/lockTransactions";

import { reduxForm, Field, SubmissionError, formValueSelector } from "redux-form";

import { Pblock } from "components/PageLayout";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import { Form, Validations } from "components/BaseComponents";
import Button from "components/augmint-ui/button";
import RadioInput from "components/augmint-ui/RadioInput";
import ToolTip from "components/ToolTip";

import { TermTable, TermTableBody, TermTableRow, TermTableCell, TermTableHeadCell, TermTableHeader } from "./styles";
import theme from "styles/theme";

class LockContainer extends React.Component {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.lockAmountValidation = this.lockAmountValidation.bind(this);
        this.defaultProductId = this.defaultProductId.bind(this);
    }

    defaultProductId() {
        let productId = this.defaultId;

        if (!productId) {
            productId = this.props.lockProducts
                .filter(product => product.isActive)
                .sort((p1, p2) => p1.durationInSecs < p2.durationInSecs)[0].id;
            this.setState({
                defaultId: productId
            });
        }
        return productId;
    }

    lockAmountValidation(value, allValues) {
        const productId = allValues.productId || this.defaultProductId();
        const minValue = this.props.lockProducts[productId].minimumLockAmount;
        const maxValue = this.props.lockProducts[productId].maxLockAmount;
        const val = parseFloat(value);

        if (val < minValue) {
            return `Minimum lockable amount is ${minValue} A-EUR for selected product`;
        } else if (val > maxValue) {
            return `Currently maximum ${maxValue} A-EUR is available for lock with selected product`;
        } else {
            return undefined;
        }
    }

    async onSubmit(values) {
        let amount,
            productId = this.props.productId ? this.props.productId : this.defaultProductId();
        try {
            amount = parseFloat(values.lockAmount);
        } catch (error) {
            throw new SubmissionError({
                _error: {
                    title: "Invalid amount",
                    details: error
                }
            });
        }

        const res = await store.dispatch(newLock(productId, amount));
        if (res.type !== LOCKTRANSACTIONS_NEWLOCK_CREATED) {
            console.error(res);
            throw new SubmissionError({
                _error: res.error
            });
        } else {
            this.setState({
                result: res.result
            });
            return res;
        }
    }

    render() {
        const { lockProducts, lockManager } = this.props;
        const { error, handleSubmit, pristine, submitting, submitSucceeded, clearSubmitErrors, reset } = this.props;

        return (
            <Pblock loading={lockManager.isLoading} header="Lock" style={{ maxWidth: "700px" }}>
                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header="New Lock submitted"
                        result={this.state.result}
                        onDismiss={() => reset()}
                    />
                )}

                {!submitSucceeded && (
                    <Form error={error ? "true" : "false"} onSubmit={handleSubmit(this.onSubmit)}>
                        {error && (
                            <EthSubmissionErrorPanel
                                error={error}
                                header="Create loan failed"
                                onDismiss={() => clearSubmitErrors()}
                            />
                        )}

                        <label>Amount to lock:</label>
                        <Field
                            name="lockAmount"
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            disabled={submitting || !lockManager.isLoaded}
                            validate={[
                                Validations.required,
                                Validations.tokenAmount,
                                this.lockAmountValidation,
                                Validations.userTokenBalance
                            ]}
                            style={{ borderRadius: theme.borderRadius.left }}
                            labelAlignRight="A-EUR"
                            data-testid="lockAmountInput"
                        />

                        <label>Select term:</label>
                        {(lockManager.isLoading || !lockManager.isLoaded) && <h5>Loading lock products...</h5>}
                        <TermTable>
                            <TermTableHeader>
                                <TermTableRow>
                                    <TermTableHeadCell  />
                                    <TermTableHeadCell  />
                                    <TermTableHeadCell >Min lock</TermTableHeadCell>
                                    <TermTableHeadCell >Max lock</TermTableHeadCell>
                                    <TermTableHeadCell >
                                        Interest p.a.
                                        <ToolTip header="Lock Interest per Annum">
                                            The annualised interest rate of the lock. It's calculated using a simple
                                            (non-compound) method and with a 365 day year.<br />
                                            Note: For small lock amounts the actual interest percent can slightly differ
                                            than displayed (~0.01 A-EUR difference in interest amount due to rounding )
                                        </ToolTip>
                                    </TermTableHeadCell>
                                    <TermTableHeadCell style={{ textAlign: "right" }}>
                                        You earn
                                    </TermTableHeadCell>
                                </TermTableRow>
                            </TermTableHeader>
                            <TermTableBody>
                                {lockProducts &&
                                    lockProducts
                                        .filter(product => product.isActive)
                                        .sort((p1, p2) => p1.durationInSecs < p2.durationInSecs)
                                        .map((product, index) => {
                                            return (
                                                <TermTableRow key={`lock-term-${product.id}`}>
                                                    <TermTableCell>
                                                        <Field
                                                            name="productId"
                                                            data-testid={"selectLockProduct-" + product.id}
                                                            val={product.id}
                                                            defaultChecked={!index}
                                                            component={RadioInput}
                                                        />
                                                    </TermTableCell>
                                                    <TermTableCell>
                                                        <label>{product.durationText}</label>
                                                    </TermTableCell>
                                                    <TermTableCell>
                                                        {product.minimumLockAmount} A€
                                                    </TermTableCell>
                                                    <TermTableCell>
                                                        {product.maxLockAmount} A€
                                                    </TermTableCell>
                                                    <TermTableCell>
                                                        {Math.floor(product.interestRatePa * 10000) / 100} %
                                                    </TermTableCell>
                                                    <TermTableCell style={{ textAlign: "right" }}>
                                                        {this.props.lockAmount &&
                                                            `${Math.floor(
                                                                this.props.lockAmount * product.perTermInterest * 100
                                                            ) / 100} A€`}
                                                    </TermTableCell>
                                                </TermTableRow>
                                            );
                                        })}
                            </TermTableBody>
                        </TermTable>

                        <Button
                            size="big"
                            disabled={pristine}
                            loading={submitting}
                            data-testid="submitButton"
                            type="submit"
                        >
                            {submitting ? "Submitting..." : "Lock"}
                        </Button>
                    </Form>
                )}
            </Pblock>
        );
    }
}

const selector = formValueSelector("LockForm");

LockContainer = connect(state => selector(state, "productId", "lockAmount"))(LockContainer);

export default reduxForm({
    form: "LockForm"
})(LockContainer);
