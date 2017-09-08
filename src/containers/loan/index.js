import React from "react";
import { Switch, Route } from "react-router-dom";
import tokenUcdProvider from "modules/tokenUcdProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import ratesProvider from "modules/ratesProvider";
import newLoanMain from "./newLoan/";
import repayLoanMain from "./repayLoan";
import loanDetails from "./loanDetailsPage";
import collectLoanMain from "./collectLoan";
import { PageNotFound } from "containers/PageNotFound";
import { EthereumState } from "containers/app/EthereumState";

export default class LoanMain extends React.Component {
    componentDidMount() {
        ratesProvider();
        tokenUcdProvider();
        loanManagerProvider();
    }

    render() {
        return (
            <div>
                <EthereumState />
                <Switch>
                    <Route path="/loan/new" component={newLoanMain} />
                    <Route path="/loan/repay" component={repayLoanMain} />
                    <Route
                        exact
                        path="/loan/collect"
                        component={collectLoanMain}
                    />
                    <Route path="/loan/:loanId" component={loanDetails} />
                    <Route component={PageNotFound} />
                </Switch>
            </div>
        );
    }
}
