import React from 'react'
import {Panel, } from 'react-bootstrap'
import {mListGroup} from 'components/mListGroups'
import LoanProductDetails from './LoanProductDetails'

export default function LoanProductList(props) {
    let products = props.products;
    const listItems = products == null ? <p>Loading products...</p> :
        products.filter( props.filter ? props.filter : () => {return true}).map( (prod, index) =>
                <LoanProductDetails key={`loanProdDiv-${prod.id}`}
                    product={prod} selectComponent={props.selectComponent}/>
    );

    return (
        <Panel header={props.header}>
            <mListGroup>
                { listItems }
            </mListGroup>
        </Panel>
    );
}
