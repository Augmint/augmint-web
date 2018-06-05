import React from "react";
import Button from "components/augmint-ui/button";
import store from "modules/store";
import { ErrorPanel, SuccessPanel } from "components/MsgPanels";
import { reduxForm, SubmissionError } from "redux-form";
import { Form, Validations, Parsers } from "components/BaseComponents";
import { subscribe, SUBSCRIBE_SUCCESS } from "modules/reducers/subscriptions";
import { Pblock } from "components/PageLayout";

import { StyledField } from "./subscribeStyles";

class Subscribe extends React.Component {
    constructor(props) {
        super(props);
        this.state = { result: null };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async handleSubmit(values) {
        let emailValidation = Validations.email(values.email);

        if (emailValidation) {
            throw new SubmissionError({
                email: emailValidation
            });
        }

        let res = await store.dispatch(subscribe(values.email));
        if (res.type !== SUBSCRIBE_SUCCESS) {
            throw new SubmissionError({
                _error: {
                    title: "Subscription Failed",
                    details: res.error
                }
            });
        } else {
            this.setState({
                result: res.result
            });
            return;
        }
    }

    render() {
        const { error, handleSubmit, pristine, submitting, submitSucceeded, clearSubmitErrors, reset } = this.props;

        return (
            <Pblock className="subscribe">
                {submitSucceeded && <SuccessPanel header="Successful subscription" onDismiss={() => reset()} />}
                {!submitSucceeded && (
                    <Form error={error ? "true" : "false"} onSubmit={handleSubmit(this.handleSubmit)}>
                        {error && (
                            <ErrorPanel
                                content={error}
                                header={"Subscription failed"}
                                onDismiss={() => {
                                    clearSubmitErrors();
                                }}
                            />
                        )}

                        <StyledField
                            component={Form.Field}
                            as={Form.Input}
                            name="email"
                            type="text"
                            label="NEWSLETTER"
                            placeholder="EMAIL ADDRESS"
                            parse={Parsers.trim}
                            disabled={submitting}
                            oneLine={true}
                        />
                        <Button
                            loading={submitting}
                            disabled={pristine}
                            className="hideIfDisables"
                            size="large"
                            type="submit"
                        >
                            {submitting ? "Submitting..." : "Subscribe"}
                        </Button>
                    </Form>
                )}
            </Pblock>
        );
    }
}

export default reduxForm({
    form: "Subscribe"
})(Subscribe);
