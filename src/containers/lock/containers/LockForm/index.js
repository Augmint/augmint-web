import React from "react";
import { reduxForm, Field } from "redux-form";
import { Label } from "semantic-ui-react";
import store from "modules/store";
import { SubmissionError } from "redux-form";

import { Pblock } from "components/PageLayout";

import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";

import { newLock, LOCKTRANSACTIONS_NEWLOCK_CREATED } from "modules/reducers/lockTransactions";

import { Form, Validations } from "components/BaseComponents";

import Button from "components/button";

import { TermTable, TermTableBody, TermTableRow, TermTableCell, TermTableHeadCell, TermTableHeader } from "./styles";

const RadioInput = props => {
    const { type = "radio", val, ...other } = props;
    return <input type={type} value={val} name={props.input.name} onChange={props.input.onChange} {...other} />;
};

class LockContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            amountValue: null,
            productId: 0
        };

        this.onTermChange = this.onTermChange.bind(this);
        this.onAmountChange = this.onAmountChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onTermChange(input, nextVal) {
        this.setState(() => ({
            productId: nextVal
        }));
    }

    onAmountChange(input, nextVal) {
        this.setState(() => ({
            amountValue: parseInt(nextVal || 0, 10)
        }));
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

        const res = await store.dispatch(newLock(this.state.productId, amount));
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
                            disabled={false}
                            onChange={this.onAmountChange}
                            validate={[Validations.required, Validations.tokenAmount, Validations.userTokenBalance]}
                            labelPosition="right"
                        >
                            <input />
                            <Label>A-EUR</Label>
                        </Field>

                        <label>Select term:</label>
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
                                        .map((product, i) => {
                                            return (
                                                <TermTableRow key={`lock-term-${i}`}>
                                                    <TermTableCell>
                                                        <Field
                                                            name="productId"
                                                            val={i}
                                                            defaultChecked={i === this.state.productId}
                                                            component={RadioInput}
                                                            onChange={this.onTermChange}
                                                        />
                                                    </TermTableCell>
                                                    <TermTableCell>
                                                        <label>{product.durationText}</label>
                                                    </TermTableCell>
                                                    <TermTableCell>{product.minimumLockAmount} A€</TermTableCell>
                                                    <TermTableCell>{product.maxLockAmount} A€</TermTableCell>
                                                    <TermTableCell>
                                                        {(product.interestRatePa * 100).toFixed(2)}%
                                                    </TermTableCell>
                                                    <TermTableCell textAlign="right">
                                                        {this.state.amountValue &&
                                                            (this.state.amountValue * product.perTermInterest).toFixed(
                                                                2
                                                            )}{" "}
                                                        A€
                                                    </TermTableCell>
                                                </TermTableRow>
                                            );
                                        })}
                            </TermTableBody>
                        </TermTable>

                        <Button
                            size="big"
                            primary
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

export default reduxForm({
    form: "LockForm"
})(LockContainer);
