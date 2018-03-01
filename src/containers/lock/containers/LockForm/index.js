import React from "react";
import { reduxForm, Field } from "redux-form";
import { connect } from "react-redux";
import { Label, Checkbox } from "semantic-ui-react";

import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";

import { Form } from "components/BaseComponents";

import Button from "components/button";

import {
    TermTable,
    TermTableBody,
    TermTableRow,
    TermTableCell,
    TermTableHeadCell,
    TermTableHeader,
} from "./styles";

const LockTerms = [
    {
        label: '3 months',
        value: 3,
    },
    {
        label: '6 months',
        value: 6,
    },
    {
        label: '1 year',
        value: 12,
    },
    {
        label: '2 years',
        value: 24,
    }
];

class LockContainer extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
    }

    render() {
        return (
            <Form>
                <Field
                    name="lockAmount"
                    component={Form.Field}
                    as={Form.Input}
                    type="number"
                    label="Amount to lock:"
                    // disabled={submitting || isLoading}
                    disabled={false}
                    // onChange={this.onTokenAmountChange}
                    onChange={() =>{}}
                    // validate={tokenAmountValidations}
                    validate={()=>{}}
                    // normalize={Normalizations.twoDecimals}
                    labelPosition="right"
                >
                    <input />
                    <Label>A-EUR</Label>
                </Field>
                <label>Select term:</label>
                <TermTable fixed>
                    <TermTableHeader>
                        <TermTableRow>
                            <TermTableHeadCell></TermTableHeadCell>
                            <TermTableHeadCell></TermTableHeadCell>
                            <TermTableHeadCell>Interest rates</TermTableHeadCell>
                            <TermTableHeadCell textAlign="right" singleLine>You earn</TermTableHeadCell>
                        </TermTableRow>
                    </TermTableHeader>
                    <TermTableBody>
                        {LockTerms.map(term => (
                            <TermTableRow key={`lock-term-${term.value}`}>
                                <TermTableCell>
                                    <Field
                                        name="term"
                                        value={term.value}
                                        component={Checkbox}
                                        onChange={this.termChange}
                                        >
                                        <input />
                                    </Field>
                                </TermTableCell>
                                <TermTableCell>
                                    <label>{term.label}</label>
                                </TermTableCell>
                                <TermTableCell>
                                        3.2% p.a.
                                </TermTableCell>
                                <TermTableCell textAlign="right">
                                        14.55 A£
                                </TermTableCell>
                            </TermTableRow>
                        ))}
                    </TermTableBody>
                </TermTable>

                <Button type="submit">Lock 50 AE for 1 year</Button>

            </Form>
        );
    }
}

const connectedLockForm = connect(()=>{})(LockContainer);

export default reduxForm({
    form: "LockForm",
})(connectedLockForm);