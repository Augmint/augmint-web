import React from "react";
import { reduxForm, Field } from "redux-form";
import { Label } from "semantic-ui-react";

import { Form, Validations } from "components/BaseComponents";

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

const RadioInput = (props) => (
    <input
        type="radio"
        name={props.input.name}
        value={props.val}
        onChange={props.input.onChange}
    />
);

class LockContainer extends React.Component {
    constructor(props) {
        super(props);
        this.onTermChange = this.onTermChange.bind(this);
    }

    
    onTermChange(input, nextVal) {
        debugger;
    }

    render() {
        const { onSubmit, handleSubmit } = this.props;
        return (
            <Form
                onSubmit={handleSubmit(onSubmit)}
            >
                <Field
                    name="lockAmount"
                    component={Form.Field}
                    as={Form.Input}
                    type="number"
                    label="Amount to lock:"
                    disabled={false}
                    onChange={() => { }}
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
                            <TermTableHeadCell></TermTableHeadCell>
                            <TermTableHeadCell></TermTableHeadCell>
                            <TermTableHeadCell>Interest rates</TermTableHeadCell>
                            <TermTableHeadCell textAlign="right" singleLine>You earn</TermTableHeadCell>
                        </TermTableRow>
                    </TermTableHeader>
                    <TermTableBody>
                        {LockTerms.map((term, i) => {
                            return (<TermTableRow key={`lock-term-${term.value}`}>
                                <TermTableCell>
                                    <Field
                                        name="term"
                                        val={term.value}
                                        component={RadioInput}
                                        onChange={this.onTermChange}
                                        validate={[Validations.required]}
                                        checked={i === 0} // first item is selected by default
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
                            )
                        })}
                    </TermTableBody>
                </TermTable>
                <Button type="submit">Lock</Button>

            </Form>
        );
    }
}

export default reduxForm({
    form: "LockForm",
})(LockContainer);