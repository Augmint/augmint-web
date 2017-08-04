import React from 'react'
import {Panel, ListGroup, ListGroupItem} from 'react-bootstrap'
import LoanDetails from './LoanDetails'

export default function LoanList(props) {
    const listItems = props.loans == null ? <p>Loading...</p> :
        props.loans.filter( props.filter ? props.filter : () => {return true}).map( (loan, index) =>
            <ListGroupItem key={`loanDiv-${loan.loanId}`}>
                <LoanDetails loan={loan} selectComponent={props.selectComponent}/>
            </ListGroupItem>
    );

    return (
        <Panel header={props.header}>
            { props.loans != null && listItems.length === 0 ?
                props.noItemMessage
            :
            <ListGroup>
                { listItems }
            </ListGroup> }
        </Panel>
    );
}
