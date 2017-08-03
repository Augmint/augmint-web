import React from 'react'
import {Panel} from 'react-bootstrap';
 import { Link } from 'react-router-dom'

export default function NewLoanSuccess(props) {

    const { address,  disbursedLoanInUcd, eth } = props.loanCreated;
    return (
        <Panel header={<h3>You've got a loan</h3>} bsStyle="success">
            <p>Your loan contract address: {address}</p>
            <p>Disbursed: {disbursedLoanInUcd } UCD</p>
            <p>Don't forget to pay it back on maturity.</p>
            <p>You can always check your loan's status on the <Link to="/">Home page</Link></p>
            <p><small>Gas used: {eth.gasUsed}</small></p>
        </Panel>
    );
}
