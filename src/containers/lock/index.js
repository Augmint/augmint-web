import React from "react";
import { Switch, Route } from "react-router-dom";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import lockList from "./lockList";
import newLock from "./newLock";
import lockDetails from "./lockDetailsPage";

import { EthereumState } from "containers/app/EthereumState";
import { PageNotFound } from "containers/PageNotFound";
import NoTokenAlert from "../account/components/NoTokenAlert";

export default class LockContainer extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        lockManagerProvider();
        loanManagerProvider();
    }

    render() {
        return (
            <div>
                <EthereumState>
                    <NoTokenAlert style={{ margin: "2em 15px 5px" }} />
                    <Switch>
                        <Route exact path="/lock" component={lockList} />
                        <Route exact path="/lock/archive" component={lockList} />
                        <Route path="/lock/new" component={newLock} />
                        <Route path="/lock/:lockId" component={lockDetails} />
                        <Route component={PageNotFound} />
                    </Switch>
                </EthereumState>
            </div>
        );
    }
}
