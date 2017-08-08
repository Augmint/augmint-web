import React from "react";
import { Panel } from "react-bootstrap";
import { MyListGroup } from "components/MyListGroups";
import LoanProductDetails from "./LoanProductDetails";

export default function LoanProductList(props) {
    let products = props.products;
    let listItems;
    if (products == null) {
        listItems = <p>Loading products...</p>;
    } else {
        let filteredProducts = products.filter(
            props.filter
                ? props.filter
                : () => {
                      return true;
                  }
        );
        if (filteredProducts.length === 0) {
            listItems = <p>No products</p>;
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
