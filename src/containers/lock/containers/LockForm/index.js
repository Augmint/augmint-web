import React from "react";
import store from "modules/store";
import { connect } from "react-redux";

import { newLock, LOCKTRANSACTIONS_NEWLOCK_CREATED } from "modules/reducers/lockTransactions";

import { reduxForm, Field, SubmissionError, formValueSelector } from "redux-form";

import { Label } from "semantic-ui-react";
import { Pblock } from "components/PageLayout";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import { Form, Validations } from "components/BaseComponents";
import { StyleLabel } from "components/augmint-ui/FormCustomLabel/styles";
import Button from "components/augmint-ui/button";

import { TermTable, TermTableBody, TermTableRow, TermTableCell, TermTableHeadCell, TermTableHeader } from "./styles";

const RadioInput = props => {
    const { type = "radio", val, ...other } = props;
    return <input type={type} value={val} name={props.input.name} onChange={props.input.onChange} {...other} />;
};

class LockContainer extends React.Component {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.lockAmountValidation = this.lockAmountValidation.bind(this);
    }

    lockAmountValidation(value, allValues) {
        const minValue = this.props.lockProducts[allValues.productId].minimumLockAmount;
        const maxValue = this.props.lockProducts[allValues.productId].maxLockAmount;
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
        let amount;
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

        const res = await store.dispatch(newLock(this.props.productId, amount));
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
                    <Form error={error ? true : false} onSubmit={handleSubmit(this.onSubmit)}>
                        {error && (
                            <EthSubmissionErrorPanel
                                error={error}
                                header="Create loan failed"
                                onDismiss={() => clearSubmitErrors()}
                            />
                        )}

                        <Field
                            name="lockAmount"
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            label="Amount to lock:"
                            disabled={submitting || !lockManager.isLoaded}
                            validate={[
                                Validations.required,
                                Validations.tokenAmount,
                                this.lockAmountValidation,
                                Validations.userTokenBalance
                            ]}
                            labelposition="right"
                        >
                            <input style={{ borderRadius: "5px 0 0 5px" }} />
                            <StyleLabel align="right">A-EUR</StyleLabel>
                        </Field>

                        <label>Select term:</label>
                        {(lockManager.isLoading || !lockManager.isLoaded) && <h5>Loading lock products...</h5>}
                        <TermTable fixed>
                            <TermTableHeader>
                                <TermTableRow>
                                    <TermTableHeadCell />
                                    <TermTableHeadCell />
                                    <TermTableHeadCell>Min lock</TermTableHeadCell>
                                    <TermTableHeadCell>Max lock</TermTableHeadCell>
                                    <TermTableHeadCell>Interest p.a.</TermTableHeadCell>
                                    <TermTableHeadCell textAlign="right" singleLine>
                                        You earn
                                    </TermTableHeadCell>
                                </TermTableRow>
                            </TermTableHeader>
                            <TermTableBody>
                                {lockProducts &&
                                    lockProducts
                                        .filter(product => product.isActive)
                                        .sort((p1, p2) => p1.durationInSecs < p2.durationInSecs)
                                        .map(product => {
                                            return (
                                                <TermTableRow key={`lock-term-${product.id}`}>
                                                    <TermTableCell>
                                                        <Field
                                                            name="productId"
                                                            val={product.id}
                                                            defaultChecked={product.id === this.props.productId}
                                                            component={RadioInput}
                                                        />
                                                    </TermTableCell>
                                                    <TermTableCell>
                                                        <label>{product.durationText}</label>
                                                    </TermTableCell>
                                                    <TermTableCell>{product.minimumLockAmount} A€</TermTableCell>
                                                    <TermTableCell>{product.maxLockAmount} A€</TermTableCell>
                                                    <TermTableCell>
                                                        {Math.floor(product.interestRatePa * 10000) / 100} %
                                                    </TermTableCell>
                                                    <TermTableCell textAlign="right">
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
    form: "LockForm",
    initialValues: { productId: 0 }
})(LockContainer);
