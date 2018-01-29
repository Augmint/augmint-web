import React from "react";
import { MyListGroup } from "components/MyListGroups";
import { Pblock } from "components/PageLayout";
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
            listItems = filteredProducts.map((prod, index) => (
                <MyListGroup.Row header={"Product " + (prod.id + 1) + " - Repay in " + prod.termText} key={prod.id}>
                    <LoanProductDetails key={`loanProdDiv-${prod.id}`} product={prod} />
                    {props.selectComponent && <props.selectComponent productId={prod.id} />}
                </MyListGroup.Row>
            ));
        }
    }

    return (
        <Pblock header={props.header}>
            <MyListGroup divided={false}>{listItems}</MyListGroup>
        </Pblock>
    );
}
