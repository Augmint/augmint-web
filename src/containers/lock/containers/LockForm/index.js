import React from "react";
import { reduxForm, Field } from "redux-form";
import { Label } from "semantic-ui-react";

import { Form, Validations } from "components/BaseComponents";

import Button from "components/button";

import { TermTable, TermTableBody, TermTableRow, TermTableCell, TermTableHeadCell, TermTableHeader } from "./styles";

const RadioInput = props => (
    <input type="radio" name={props.input.name} value={props.val} onChange={props.input.onChange} />
);

class LockContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            amountValue: null,
            productId: null
        };

        this.onTermChange = this.onTermChange.bind(this);
        this.onAmountChange = this.onAmountChange.bind(this);
    }

    onTermChange(input, nextVal) {
        if (this.state.amout && nextVal) {
            this.setState(() => ({
                productId: nextVal
            }));
        }
    }

    onAmountChange(input, nextVal) {
        this.setState(() => ({
            amountValue: parseInt(nextVal || 0, 10)
        }));
    }

    render() {
        const { lockProducts, onSubmit, handleSubmit } = this.props;
        return (
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Field
                    name="lockAmount"
                    component={Form.Field}
                    as={Form.Input}
                    type="number"
                    label="Amount to lock:"
                    disabled={false}
                    onChange={this.onAmountChange}
                    validate={[Validations.required]}
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
                            lockProducts.filter(product => product.isActive).map((product, i) => {
                                return (
                                    <TermTableRow key={`lock-term-${i}`}>
                                        <TermTableCell>
                                            <Field
                                                name="productId"
                                                val={i}
                                                component={RadioInput}
                                                onChange={this.onTermChange}
                                                validate={[Validations.required]}
                                            >
                                                <input />
                                            </Field>
                                        </TermTableCell>
                                        <TermTableCell>
                                            <label>{product.durationText}</label>
                                        </TermTableCell>
                                        <TermTableCell>{product.minimumLockAmount} A€</TermTableCell>
                                        <TermTableCell>{product.maxLockAmount} A€</TermTableCell>
                                        <TermTableCell>{(product.interestRatePa * 100).toFixed(2)}%</TermTableCell>
                                        <TermTableCell textAlign="right">
                                            {this.state.amountValue &&
                                                (this.state.amountValue * product.perTermInterest).toFixed(2)}{" "}
                                            A€
                                        </TermTableCell>
                                    </TermTableRow>
                                );
                            })}
                    </TermTableBody>
                </TermTable>
                <Button disabled={!this.state.amountValue && !this.state.productId} type="submit">
                    Lock
                </Button>
            </Form>
        );
    }
}

export default reduxForm({
    form: "LockForm"
})(LockContainer);
