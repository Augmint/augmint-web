import React from "react";
import { reduxForm, Field } from "redux-form";
import { connect } from "react-redux";
import { Label, Checkbox } from "semantic-ui-react";

import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";

import { Form } from "components/BaseComponents";

const Radio = (props) => {
    const { label } = props;

    return (<Checkbox label={label} radio>
        {props.children}
    </Checkbox>)
}

const LockMaturities = [
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
                    label='A-EUR to lock'
                    component={Form.Field}
                    as={Form.Input}
                    type="number"
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

                {LockMaturities.map(maturity => (
                    <Field
                        key={`lock-maturity-${maturity.value}`}
                        label={maturity.label}
                        name="maturity"
                        value={maturity.value}
                        component={Radio}
                    >
                        <input />
                    </Field>
                ))}

            </Form>
        );
    }
}

const connectedLockForm = connect(()=>{})(LockContainer);

export default reduxForm({
    form: "LockForm",
})(connectedLockForm);