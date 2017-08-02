import React from 'react'
import {Panel} from 'react-bootstrap';

export default function NewLoanSuccess(props) {

    const { address,  disbursedLoanInUcd, eth } = props.loanCreated;
    return (
        <Panel header="You've got a loan" bsStyle="success">
            <p>Your loan contract address: {address}</p>
            <p>Disbursed: {disbursedLoanInUcd / 10000} UCD</p>
            <p>Don't forget to pay it back on maturity.</p>
            <p>You can always check your loan's status on the home page</p>
            <p><small>Gas used: {eth.gasUsed}</small></p>
        </Panel>
    );
}
