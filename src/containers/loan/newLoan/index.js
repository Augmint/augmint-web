import React from "react";
import { Route } from "react-router-dom";
import LoanProductSelector from "./LoanProductSelector";
import { Pheader, Psegment } from "components/PageLayout";

import TopNavTitlePortal from "components/portals/TopNavTitlePortal";

const newLoanMain = () => (
    <Psegment>
        <TopNavTitlePortal>
            <Pheader className="secondaryColor" header="Get an A-EUR loan" />
        </TopNavTitlePortal>

        <Route exact path="/loan/new" component={LoanProductSelector} />
    </Psegment>
);

export default newLoanMain;
