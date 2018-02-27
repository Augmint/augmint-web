import React from "react";
import { reduxForm, Field } from "redux-form";
import { connect } from "react-redux";
import { Label } from "semantic-ui-react";

import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import { EthereumState } from "containers/app/EthereumState";

import { Form } from "components/BaseComponents";
import { Pcontainer } from "components/PageLayout";

class LockContainer extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
    }

    render() {
        return (
            <Pcontainer>
                <EthereumState>
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
                    </Form>
                </EthereumState>
            </Pcontainer>
        );
    }
}

const connectedLockContainer = connect(()=>{})(LockContainer);

export default reduxForm({
    form: "LockForm",
})(connectedLockContainer);