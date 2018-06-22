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
                <MyListGroup.Row
                    wrap={true}
                    header={`Product ${prod.id + 1} - Repay in ${prod.termText}${
                        prod.termInDays < 5 ? " (for testing)" : ""
                    }`}
                    key={prod.id}
                >
                    <MyListGroup.Col>
                        <LoanProductDetails key={`loanProdDiv-${prod.id}`} product={prod} />
                    </MyListGroup.Col>
                    {props.selectComponent && (
                        <MyListGroup.Col style={{ paddingBottom: "2rem" }}>
                            <props.selectComponent productId={prod.id} />
                        </MyListGroup.Col>
                    )}
                </MyListGroup.Row>
            ));
        }
    }

    return (
        <Pblock header={props.header}>
            <MyListGroup>{listItems}</MyListGroup>
        </Pblock>
    );
}
