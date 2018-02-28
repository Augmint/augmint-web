import React from "react";
import { reduxForm, Field } from "redux-form";
import { connect } from "react-redux";
import { Label, Checkbox } from "semantic-ui-react";

import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";

import { Form } from "components/BaseComponents";

const Radio = (props) => (
    <Checkbox radio {...props}>
        {props.children}
    </Checkbox>
)

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

                <Field label="3 months" name="maturity" value="3" component={Radio}>
                    <input />
                </Field>
                <Field label="6 months" name="maturity" value="6" component={Radio}>
                    <input />
                </Field>
                <Field label="1 year" name="maturity" value="12" radio component={Radio}>
                    <input />
                </Field>
                <Field label="2 years" name="maturity" value="24" radio component={Radio}>
                    <input />
                </Field>
            </Form>
        );
    }
}

const connectedLockForm = connect(()=>{})(LockContainer);

export default reduxForm({
    form: "LockForm",
})(connectedLockForm);