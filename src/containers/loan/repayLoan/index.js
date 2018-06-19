import React from "react";
import { Route } from "react-router-dom";
import RepayLoanPage from "./RepayLoanPage";
import LoanSelector from "./LoanSelector";
import { Psegment, Pheader } from "components/PageLayout";
import TopNavTitlePortal from 'components/portals/TopNavTitlePortal';
import { FeatureContext } from "modules/services/featureService";

const repayLoanMain = () => (
    <Psegment>
        <FeatureContext>
            {features => {
                const dashboard = features.dashboard;
                return (
                    <TopNavTitlePortal>
                        <Pheader className={ dashboard ? "secondaryColor" : "" } header="Repay loan" />
                    </TopNavTitlePortal>
                );
            }}
        </FeatureContext>

        <Route exact path="/loan/repay" component={LoanSelector} />
        <Route path="/loan/repay/:loanId" component={RepayLoanPage} />
    </Psegment>
);

export default repayLoanMain;
