import React from "react";
import { Route } from "react-router-dom";
import RepayLoanPage from "./RepayLoanPage";
import LoanSelector from "./LoanSelector";
import { Psegment, Pheader } from "components/PageLayout";

const repayLoanMain = () => (
    <Psegment>
        <Pheader header="Repay loan" />

        <Route exact path="/loan/repay" component={LoanSelector} />
        <Route path="/loan/repay/:loanId" component={RepayLoanPage} />
    </Psegment>
);

export default repayLoanMain;
