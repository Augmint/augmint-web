import React from "react";
import { connect } from "react-redux";
import augmintTokenProvider from "modules/augmintTokenProvider";

import { AugmintTokenInfo } from "./components/AugmintTokenInfo";
import { MonetarySupervisorInfo } from "./components/MonetarySupervisorInfo";
import { Pgrid } from "components/PageLayout";

class BaseInfoGroup extends React.Component {
    componentDidMount() {
        augmintTokenProvider();
    }

    render() {
        return (
            <Pgrid columns={2}>
                <Pgrid.Column>
                    <AugmintTokenInfo contract={this.props.augmintToken} />
                </Pgrid.Column>
                <Pgrid.Column>
                    <MonetarySupervisorInfo contract={this.props.monetarySupervisor} />
                </Pgrid.Column>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    augmintToken: state.augmintToken,
    monetarySupervisor: state.monetarySupervisor,
    userBalances: state.userBalances,
    accounts: state.web3Connect.accounts
});

export default connect(mapStateToProps)(BaseInfoGroup);
