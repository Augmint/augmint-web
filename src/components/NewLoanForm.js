/*  TODO: move this to containers b/c it's not stateless
    TODO: form validation. eg: http://redux-form.com or more: https://react.rocks/tag/Validation
    FIXME:  clear success and error states after submit
    FIXME: 20UCD disbursed is not enough for minDisbursedAmountInUcd b/c of rounding issues.
            handle different values calculated here & in contract at tx.
            Introduce BigNumbers + figure out rounding (here and rates too)  */

import React from 'react'
import {Panel,FormGroup, FormControl, InputGroup, ControlLabel, Button, HelpBlock} from 'react-bootstrap';
import ToolTip from './ToolTip';
import store from '../store'
import { newLoan } from '../modules/loanManager'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

class NewLoanForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            disbursedUcdAmount: '',
            loanUcdAmount: '',
            ethAmount: '',
            input: null
        }
        this.onDisbursedUcdAmountChange = this.onDisbursedUcdAmountChange.bind(this);
        this.onLoanUcdAmountChange = this.onLoanUcdAmountChange.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onSuccess = this.onSuccess.bind(this);
    }

    onDisbursedUcdAmountChange(e) {
        let loanUcdAmount = e.target.value * (1 / this.props.product.discountRate);
        this.setState({
            input: 'disbursedUCD',
            disbursedUcdAmount: e.target.value,
            loanUcdAmount: loanUcdAmount,
            ethAmount: loanUcdAmount / this.props.product.loanCoverageRatio * this.props.rates.usdEthRate
        });
        //}
    }

    onLoanUcdAmountChange(e) {
        let disbursedUcdAmount = e.target.value * this.props.product.discountRate
        this.setState({
            input: 'loanUCD',
            disbursedUcdAmount: disbursedUcdAmount,
            loanUcdAmount: e.target.value,
            ethAmount: e.target.value / this.props.product.loanCoverageRatio * this.props.rates.usdEthRate
        });
        //}
    }

    onEthAmountChange(e) {
        let loanUcdAmount = e.target.value * this.props.product.loanCoverageRatio * this.props.rates.ethUsdRate
        this.setState({
            input: 'ETH',
            disbursedUcdAmount: loanUcdAmount * this.props.product.discountRate,
            loanUcdAmount: loanUcdAmount,
            ethAmount: e.target.value
        });
    }

    onFormSubmit(e) {
        e.preventDefault();
        store.dispatch(newLoan(this.props.product.id, this.state.ethAmount));
    }

    // TODO: make it a separate component, push browser history or redirect to myUcd displaying success there
    onSuccess() {
        return(
            <Panel header="You've got a loan" bsStyle="success">
                <p>Your loan contract address: {this.props.loanContractAddress}</p>
                <p>Don't forget to pay it back on maturity.</p>
                <p>You can check your loan status on the home page</p>
            </Panel>
        )
    }

    stringifyError (err, filter, space) { // TODO: move this (together with error Panel) to a common place
        var plainObject = {};
        Object.getOwnPropertyNames(err).forEach(function(key) {
            plainObject[key] = err[key];
        });
        return JSON.stringify(plainObject, filter, space);
    };

    render () {
        if( this.props.loanContractAddress ) {
            return this.onSuccess();
        }  else {
            return(
                <form onSubmit={this.onFormSubmit}>
                    {this.props.error ?
                        <Panel header={`Submit error ${this.props.error.message ? " - " + this.props.error.message : ""} `}
                            bsStyle="danger" collapsible={true}>
                            // TODO: this doesn't wrap
                            <div className="white-space: pre-wrap">
                                {this.stringifyError( this.props.error, null, "\t")}
                            </div>
                        </Panel>
                        : ''
                    }
                    <fieldset disabled={this.state.isSubmitting} >
                        <legend>Loan parameters</legend>

                        <FormGroup bsSize="large">
                            <ControlLabel>Disbursed amount (to be payed out) </ControlLabel>
                            <InputGroup>
                                <FormControl id='disbursedUcdAmount' type='number' onChange={this.onDisbursedUcdAmountChange} value={this.state.disbursedUcdAmount}/>
                                <InputGroup.Addon>UCD</InputGroup.Addon>
                            </InputGroup>
                            <HelpBlock>Disbursed amount: Loan amount x Discount Rate ( {this.props.product.discountRate * 100}% ) </HelpBlock>
                        </FormGroup>

                        <FormGroup bsSize="large">
                            <ControlLabel>Loan amount (to be payed back)</ControlLabel>
                            <InputGroup>
                                <FormControl id='loanUcdAmount' type='number' onChange={this.onLoanUcdAmountChange} value={this.state.loanUcdAmount}/>
                                <InputGroup.Addon>UCD</InputGroup.Addon>
                            </InputGroup>
                            <HelpBlock>Loan amount: Disbursed amount x ( 1 /  Discount Rate ( {this.props.product.discountRate * 100}% ) )</HelpBlock>
                        </FormGroup>


                        <FormGroup bsSize="large">
                            <ControlLabel>Collateral</ControlLabel>
                            <InputGroup >
                                <FormControl id='ethAmount' type='number' onChange={this.onEthAmountChange} value={this.state.ethAmount}/>
                                <InputGroup.Addon>ETH</InputGroup.Addon>
                            </InputGroup>
                            <HelpBlock>ETH will be held as collateral: Loan Amount / ETHUSD rate x (1 / Coverage ratio)
                                = {this.state.loanUcdAmount} / {Math.round(this.props.rates.ethUsdRate*100)/100} x { 1 / this.props.product.loanCoverageRatio * 100}%
                                 </HelpBlock>
                        </FormGroup>
                        <FormGroup>
                            <Button type="submit" bsSize="large" bsStyle="primary" >
                                {this.state.isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        </FormGroup>
                    </fieldset>
                </form>
            )
        }
    }
}

const mapStateToProps = state => ({
    isSubmitting: state.loanManager.isSubmitting,
    error: state.loanManager.error,
    loanContractAddress: state.loanManager.loanContractAddress
})

export default connect(
    mapStateToProps
)(NewLoanForm)
