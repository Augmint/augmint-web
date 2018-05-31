import React from "react";
import { Route } from "react-router-dom";
import NewLoanPage from "./NewLoanPage";
import LoanProductSelector from "./LoanProductSelector";
import { Pheader, Psegment } from "components/PageLayout";

import TopNavTitlePortal from 'components/portals/TopNavTitlePortal';
import { FeatureContext } from "modules/services/featureService";

const newLoanMain = () => (
    <Psegment>
        <TopNavTitlePortal>
            <FeatureContext>
                {features => features.dashboard ? <Pheader className="secondaryColor" header="Get an A-EUR loan" /> : <Pheader header="Get an A-EUR loan" />}
            </FeatureContext>
        </TopNavTitlePortal>


        <Route exact path="/loan/new" component={LoanProductSelector} />
        <Route path="/loan/new/:loanProductId" component={NewLoanPage} />
    </Psegment>
);

export default newLoanMain;
