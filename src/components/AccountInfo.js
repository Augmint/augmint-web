import React from 'react'
import {Panel} from 'react-bootstrap';

export default function AccountInfo(props) {
    return(
        <Panel header={props.title}>
            <p>Account: {props.account.address}</p>
            <p>Balances: {props.account.ethBalance} ETH | {props.account.ucdBalance} UCD</p>
        </Panel>
    );
}
