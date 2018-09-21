import React from "react";
import { Switch, Route } from "react-router-dom";
// import { connect } from "react-redux";

import { connectWeb3 } from "modules/web3Provider";

import augmintTokenProvider from "modules/augmintTokenProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import loanManagerProvider from "modules/loanManagerProvider";
// import ratesProvider from "modules/ratesProvider";

import { EthereumState } from "containers/app/EthereumState";

import { PageNotFound } from "containers/PageNotFound";

import lockList from "./lockList";
import newLock from "./newLock";
import lockDetails from "./lockDetailsPage";
// import CollectLoanMain from "./collectLoan"; - Release?

export default class LockContainer extends React.Component {
    componentDidMount() {
        connectWeb3();
        // ratesProvider();
        augmintTokenProvider();
        lockManagerProvider();
        loanManagerProvider();
    }

    render() {
        return (
            <div>
                <EthereumState>
                    <Switch>
                        <Route exact path="/lock" component={lockList} />
                        <Route exact path="/lock/archive" component={lockList} /> {/* Released */}
                        <Route path="/lock/new" component={newLock} />
                        {/* <Route exact path="/loan/collect" component={CollectLoanMain} /> - Release? */}
                        <Route path="/lock/:lockId" component={lockDetails} />
                        <Route component={PageNotFound} />
                    </Switch>
                </EthereumState>
            </div>
        );
    }
}

// const mapStateToProps = state => {
//     return {
//         lockManager: state.lockManager,
//         lockProducts: state.lockManager.products
//     };
// };

// export default connect(mapStateToProps)(LockContainer);
