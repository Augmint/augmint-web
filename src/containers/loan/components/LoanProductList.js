import React from "react";
import { Panel } from "react-bootstrap";
import { MyListGroup } from "components/MyListGroups";
import LoanProductDetails from "./LoanProductDetails";

export default function LoanProductList(props) {
    let products = props.products;
    let listItems;
    if (products == null) {
        listItems = <span>Loading products...</span>;
    } else {
        let filteredProducts = products.filter(
            props.filter
                ? props.filter
                : () => {
                      return true;
                  }
        );
        if (filteredProducts.length === 0) {
            listItems = <span>No products</span>;
        } else {
            listItems = filteredProducts.map((prod, index) =>
                <LoanProductDetails
                    key={`loanProdDiv-${prod.id}`}
                    product={prod}
                    selectComponent={props.selectComponent}
                />
            );
        }
    }

    return (
        <Panel header={props.header}>
            <MyListGroup>
                {listItems}
            </MyListGroup>
        </Panel>
    );
}
