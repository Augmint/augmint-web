import React from "react";
import { Switch, Route } from "react-router-dom";
import augmintTokenProvider from "modules/augmintTokenProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import ratesProvider from "modules/ratesProvider";
import loanList from "./loanList";

import repayLoanMain from "./repayLoan";
import CollectLoanMain from "./collectLoan";
import { PageNotFound } from "containers/PageNotFound";
import { EthereumState } from "containers/app/EthereumState";
import NoTokenAlert from "../account/components/NoTokenAlert";

export default class LoanMain extends React.Component {
    componentDidMount() {
        ratesProvider();
        augmintTokenProvider();
        loanManagerProvider();
        lockManagerProvider();
    }

    render() {
        return (
            <div>
                <EthereumState>
                    <NoTokenAlert style={{ margin: "2em 15px 5px" }} />
                    <Switch>
                        <Route exact path="/loan" component={loanList} />
                        <Route exact path="/loan/archive" component={loanList} />
                        <Route path="/loan/new" component={loanList} />
                        <Route path="/loan/repay" component={repayLoanMain} />
                        <Route exact path="/loan/collect" component={CollectLoanMain} />
                        <Route component={PageNotFound} />
                    </Switch>
                </EthereumState>
            </div>
        );
    }
}
