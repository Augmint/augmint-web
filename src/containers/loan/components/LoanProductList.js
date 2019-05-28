import React from "react";
import { Pblock } from "components/PageLayout";
import NewLoanPage from "../newLoan/NewLoanPage";

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
        }
    }

    return (
        <Pblock className="loan-product-list" noMargin={true}>
            {listItems}
            {!listItems && <NewLoanPage />}
        </Pblock>
    );
}
