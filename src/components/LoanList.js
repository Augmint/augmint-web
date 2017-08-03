import React from 'react'
import {Panel, ListGroup, ListGroupItem} from 'react-bootstrap'
import LoanDetails from './LoanDetails'

export default function LoanList(props) {
    const listItems = props.loans == null ? <p>Loading...</p> :
        props.loans.map( (loan, index) =>
            <ListGroupItem key={`loanDiv-${loan.loanId}`}>
                <LoanDetails loan={loan} />
            </ListGroupItem>
    );

    return (
        <Panel header={props.title}>
            { props.loans != null && props.loans.length === 0 ?
                <p>You have no loans.</p>
            :
            <ListGroup>
                { listItems }
            </ListGroup> }
        </Panel>
    );
}
