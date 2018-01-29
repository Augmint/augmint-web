import React from "react";
import { connect } from "react-redux";
import augmintTokenProvider from "modules/augmintTokenProvider";
import Web3ConnectionInfo from "./components/Web3ConnectionInfo";
import { AugmintTokenInfo } from "./components/AugmintTokenInfo";
import { UserAccountInfo } from "./components/UserAccountInfo";
import { ArrayDump } from "./components/ArrayDump";
import { SignTest } from "./components/SignTest";
import { Pgrid } from "components/PageLayout";

class BaseInfoGroup extends React.Component {
    componentDidMount() {
        augmintTokenProvider();
    }

    render() {
        const { web3Connect, userBalances, augmintToken, accounts } = this.props;
        return (
            <Pgrid columns={3}>
                <Pgrid.Column>
                    <Web3ConnectionInfo web3Connect={web3Connect} />
                    <UserAccountInfo userBalances={userBalances} />
                    <SignTest web3Connect={web3Connect} />
                </Pgrid.Column>
                <Pgrid.Column>
                    <AugmintTokenInfo contract={augmintToken} />
                </Pgrid.Column>
                <Pgrid.Column>
                    <ArrayDump header="Accounts" items={accounts} />
                </Pgrid.Column>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    augmintToken: state.augmintToken,
    userBalances: state.userBalances,
    accounts: state.web3Connect.accounts
});

export default connect(mapStateToProps)(BaseInfoGroup);
