import React from "react";
import { Route } from "react-router-dom";
import NewLoanPage from "./NewLoanPage";
import LoanProductSelector from "./LoanProductSelector";
import { Pheader, Psegment } from "components/PageLayout";

const newLoanMain = () => (
    <Psegment>
        <Pheader header="Get an A-EUR loan" />

        <Route exact path="/loan/new" component={LoanProductSelector} />
        <Route path="/loan/new/:loanProductId" component={NewLoanPage} />
    </Psegment>
);

export default newLoanMain;
