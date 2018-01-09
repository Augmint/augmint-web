import React from "react";
import { Button } from "semantic-ui-react";
import store from "modules/store";
import { ErrorPanel, SuccessPanel } from "components/MsgPanels";
import { reduxForm, SubmissionError, Field } from "redux-form";
import { Form, Validations, Parsers } from "components/BaseComponents";
import { subscribe, SUBSCRIBE_SUCCESS } from "modules/reducers/subscriptions";
import { Pblock } from "components/PageLayout";

class SubscribeForm extends React.Component {
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
            console.error("SubmissionError", res);
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
            <Pblock>
                {submitSucceeded && <SuccessPanel header="Successful subscription" onDismiss={() => reset()} />}
                {!submitSucceeded && (
                    <Form error={error ? true : false} onSubmit={handleSubmit(this.handleSubmit)}>
                        <ErrorPanel
                            content={error}
                            header={"Subscription failed"}
                            onDismiss={() => {
                                clearSubmitErrors();
                            }}
                        />

                        <Field
                            component={Form.Field}
                            as={Form.Input}
                            name="email"
                            type="text"
                            label="Keep me posted"
                            placeholder="your email"
                            parse={Parsers.trim}
                            disabled={submitting}
                        />
                        <Button loading={submitting} primary disabled={pristine} size="large">
                            {submitting ? "Submitting..." : "Subscribe"}
                        </Button>
                    </Form>
                )}
            </Pblock>
        );
    }
}

// const mapStateToProps = state => ({
//     tokenUcd: state.tokenUcd
// });
//
//SubscribeForm = connect(SubscribeForm);

export default reduxForm({
    form: "SubscribeForm"
})(SubscribeForm);
