import React from "react";
import { Route } from "react-router-dom";
import RepayLoanPage from "./RepayLoanPage";
import LoanSelector from "./LoanSelector";
import { Psegment, Pheader } from "components/PageLayout";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";

const repayLoanMain = () => (
    <Psegment>
        <TopNavTitlePortal>
            <Pheader header="Repay loan" />
        </TopNavTitlePortal>

        <Route exact path="/loan/repay" component={LoanSelector} />
        <Route path="/loan/repay/:loanId" component={RepayLoanPage} />
    </Psegment>
);

export default repayLoanMain;
