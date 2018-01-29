import React from "react";
import { Switch, Route } from "react-router-dom";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import ratesProvider from "modules/ratesProvider";
import newLoanMain from "./newLoan/";
import repayLoanMain from "./repayLoan";
import loanDetails from "./loanDetailsPage";
import CollectLoanMain from "./collectLoan";
import { PageNotFound } from "containers/PageNotFound";
import { EthereumState } from "containers/app/EthereumState";

export default class LoanMain extends React.Component {
    componentDidMount() {
        connectWeb3();
        ratesProvider();
        augmintTokenProvider();
        loanManagerProvider();
    }

    render() {
        return (
            <div>
                <EthereumState>
                    <Switch>
                        <Route path="/loan/new" component={newLoanMain} />
                        <Route path="/loan/repay" component={repayLoanMain} />
                        <Route exact path="/loan/collect" component={CollectLoanMain} />
                        <Route path="/loan/:loanId" component={loanDetails} />
                        <Route component={PageNotFound} />
                    </Switch>
                </EthereumState>
            </div>
        );
    }
}
