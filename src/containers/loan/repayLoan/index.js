import React from "react";
import { Route } from "react-router-dom";
import RepayLoanPage from "./RepayLoanPage";

import { Psegment, Pheader } from "components/PageLayout";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";

const repayLoanMain = () => (
    <Psegment>
        <TopNavTitlePortal>
            <Pheader header="Repay loan" />
        </TopNavTitlePortal>

        <Route path="/loan/repay/:loanId/:loanManagerAddress" component={RepayLoanPage} />
    </Psegment>
);

export default repayLoanMain;
