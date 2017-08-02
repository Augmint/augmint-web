/*
TODO: move this to containers b/c it's not stateless
TODO: form validation. eg: http://redux-form.com or more: https://react.rocks/tag/Validation
FIXME:  clear success and error states after submit
FIXME: Rounding issues. Eg. 20UCD entered to disbursed is not enough for minDisbursedAmountInUcd
                            100 UCD requested to disbursed is 99.9999 actual
        - handle different values calculated here & in contract at tx.
        - rates precision is too high?
        - Introduce BigNumbers + figure out rounding (here and rates too)  */

import React from 'react'
import {Panel,FormGroup, FormControl, InputGroup, ControlLabel, Button, HelpBlock} from 'react-bootstrap';
import { Form, Field, reduxForm } from 'redux-form'

const FieldInput = ({ input, meta, type, placeholder, min, max}) => {
    return (
        <FormControl
            id={input.name}
            type={type}
            placeholder={placeholder}
            min={min}
            max={max}
            value={input.value}
            onChange={input.onChange} />
    )
}

class NewLoanForm extends React.Component {

    constructor(props) {
        super(props);
        this.onDisbursedUcdAmountChange = this.onDisbursedUcdAmountChange.bind(this);
        this.onLoanUcdAmountChange = this.onLoanUcdAmountChange.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
    }

    onDisbursedUcdAmountChange(e) {
        let loanUcdAmount = e.target.value * (1 / this.props.product.discountRate);
        let ethAmount = loanUcdAmount / this.props.product.loanCoverageRatio * this.props.rates.usdEthRate;
        this.props.change("loanUcdAmount", loanUcdAmount);
        this.props.change("ethAmount",ethAmount)
    }

    onLoanUcdAmountChange(e) {
        let disbursedUcdAmount = e.target.value * this.props.product.discountRate
        let ethAmount = e.target.value / this.props.product.loanCoverageRatio * this.props.rates.usdEthRate
        this.props.change("disbursedUcdAmount", disbursedUcdAmount);
        this.props.change("ethAmount",ethAmount )
    }

    onEthAmountChange(e) {
        let loanUcdAmount = e.target.value * this.props.product.loanCoverageRatio * this.props.rates.ethUsdRate
        let disbursedUcdAmount = loanUcdAmount * this.props.product.discountRate;
        this.props.change("disbursedUcdAmount", disbursedUcdAmount);
        this.props.change("loanUcdAmount", loanUcdAmount )
    }

    stringifyError (err, filter, space) { // TODO: move this (together with error Panel) to a common place
        var plainObject = {};
        Object.getOwnPropertyNames(err).forEach(function(key) {
            plainObject[key] = err[key];
        });
        return JSON.stringify(plainObject, filter, space);
    };

    render () {
        const { error, handleSubmit, pristine, submitting} = this.props
        return(
            <Form onSubmit={handleSubmit}>
                {error &&
                    <Panel header={`Submission error ${error.title ? ": " + error.title : error } `}
                        bsStyle="danger" collapsible={true}>
                        {/* TODO: this doesn't wrap */}
                        <div className="white-space: pre-wrap">
                            {this.stringifyError( error.details, null, "\t") }
                        </div>
                    </Panel>
                }
                <fieldset disabled={submitting} >
                    <legend>Loan parameters</legend>

                    <FormGroup bsSize="large">
                        <ControlLabel>Disbursed amount (to be payed out) </ControlLabel>
                        <InputGroup>
                            <Field name="disbursedUcdAmount" component={FieldInput} type="number" onChange={this.onDisbursedUcdAmountChange}  />
                            <InputGroup.Addon>UCD</InputGroup.Addon>
                        </InputGroup>
                        <HelpBlock>Disbursed amount = Loan amount x Discount Rate </HelpBlock>
                    </FormGroup>

                    <FormGroup bsSize="large">
                        <ControlLabel>Loan amount (to be payed back)</ControlLabel>
                        <InputGroup>
                            <Field name="loanUcdAmount" component={FieldInput} type="number" onChange={this.onLoanUcdAmountChange}  />
                            <InputGroup.Addon>UCD</InputGroup.Addon>
                        </InputGroup>
                        <HelpBlock>Loan UCD amount = Disbursed amount x ( 1 /  Discount Rate )</HelpBlock>
                    </FormGroup>


                    <FormGroup bsSize="large">
                        <ControlLabel>Collateral</ControlLabel>
                        <InputGroup >
                            <Field name="ethAmount" component={FieldInput} type="number" onChange={this.onEthAmountChange}  />
                            <InputGroup.Addon>ETH</InputGroup.Addon>
                        </InputGroup>
                        <HelpBlock>ETH to be held as collateral = UCD Loan Amount / ETHUSD rate x (1 / Coverage ratio)
                            <br/>( ETH/USD Rate = {Math.round(this.props.rates.ethUsdRate*100)/100} )
                        </HelpBlock>
                    </FormGroup>
                    <FormGroup>
                        <Button type="submit" bsSize="large" bsStyle="primary" disabled={pristine}>
                            {submitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </FormGroup>
                </fieldset>
            </Form>
        )
    }
}

export default NewLoanForm = reduxForm({
    form: 'NewLoanForm'
})(NewLoanForm)
