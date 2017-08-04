import React from 'react'
import {Panel, ListGroup} from 'react-bootstrap'
import LoanProductDetails from './LoanProductDetails'

export default function LoanProductList(props) {
    let products = props.products;
    // TODO: this causing a warning, table nested in <p>. Bootstrap has class for table within panel...
    const listItems = products == null ? <p>Loading products...</p> :
        products.filter( props.filter).map( (prod, index) =>
                <LoanProductDetails key={`loanProdDiv-${prod.id}`}
                    product={prod} selectComponent={props.selectComponent}/>
    );

    return (
        <Panel header={props.header}>
            <ListGroup>
                { listItems }
            </ListGroup>
        </Panel>
    );
}
