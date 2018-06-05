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

import { TermTable, TermTableBody, TermTableRow, TermTableCell, TermTableHeadCell, TermTableHeader } from "./styles";
import theme from "styles/theme";

class LockContainer extends React.Component {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.lockAmountValidation = this.lockAmountValidation.bind(this);
    }

    lockAmountValidation(value, allValues) {
        const sortedActivLocks = this.props.lockProducts
            .filter(product => product.isActive)
            .sort((p1, p2) => p1.durationInSecs < p2.durationInSecs);
        const minValue = allValues.productId
            ? this.props.lockProducts[allValues.productId].minimumLockAmount
            : sortedActivLocks[0].minimumLockAmount;
        const maxValue = allValues.productId
            ? this.props.lockProducts[allValues.productId].maxLockAmount
            : sortedActivLocks[0].maxLockAmount;
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
        const sortedActivLocks = this.props.lockProducts
            .filter(product => product.isActive)
            .sort((p1, p2) => p1.durationInSecs < p2.durationInSecs);
        let amount,
            productId = this.props.productId ? this.props.productId : sortedActivLocks[0].id;
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
        const { lockProducts, lockManager, dashboard } = this.props;
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
                        />

                        <label>Select term:</label>
                        {(lockManager.isLoading || !lockManager.isLoaded) && <h5>Loading lock products...</h5>}
                        <TermTable>
                            <TermTableHeader>
                                <TermTableRow>
                                    <TermTableHeadCell {...{ dashboard }} />
                                    <TermTableHeadCell {...{ dashboard }} />
                                    <TermTableHeadCell {...{ dashboard }}>Min lock</TermTableHeadCell>
                                    <TermTableHeadCell {...{ dashboard }}>Max lock</TermTableHeadCell>
                                    <TermTableHeadCell {...{ dashboard }}>Interest p.a.</TermTableHeadCell>
                                    <TermTableHeadCell style={{ textAlign: "right" }} {...{ dashboard }}>
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
                                                    <TermTableCell {...{ dashboard }}>
                                                        <Field
                                                            name="productId"
                                                            val={product.id}
                                                            defaultChecked={!index}
                                                            component={RadioInput}
                                                        />
                                                    </TermTableCell>
                                                    <TermTableCell {...{ dashboard }}>
                                                        <label>{product.durationText}</label>
                                                    </TermTableCell>
                                                    <TermTableCell {...{ dashboard }}>
                                                        {product.minimumLockAmount} A€
                                                    </TermTableCell>
                                                    <TermTableCell {...{ dashboard }}>
                                                        {product.maxLockAmount} A€
                                                    </TermTableCell>
                                                    <TermTableCell {...{ dashboard }}>
                                                        {Math.floor(product.interestRatePa * 10000) / 100} %
                                                    </TermTableCell>
                                                    <TermTableCell {...{ dashboard }} style={{ textAlign: "right" }}>
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
