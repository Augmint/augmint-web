import React from "react";
import { connect } from "react-redux";
import tokenUcdProvider from "modules/tokenUcdProvider";
import Web3ConnectionInfo from "./components/Web3ConnectionInfo";
import { TokenUcdInfo } from "./components/TokenUcdInfo";
import { UserAccountInfo } from "./components/UserAccountInfo";
import { ArrayDump } from "./components/ArrayDump";
import { Pgrid } from "components/PageLayout";

class BaseInfoGroup extends React.Component {
    componentDidMount() {
        tokenUcdProvider();
    }

    render() {
        const { web3Connect, userBalances, tokenUcd, accounts } = this.props;
        return (
            <Pgrid columns={3}>
                <Pgrid.Column>
                    <Web3ConnectionInfo web3Connect={web3Connect} />
                    <UserAccountInfo userBalances={userBalances} />
                </Pgrid.Column>
                <Pgrid.Column>
                    <TokenUcdInfo contract={tokenUcd} />
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
    tokenUcd: state.tokenUcd,
    userBalances: state.userBalances,
    accounts: state.web3Connect.accounts
});

export default connect(mapStateToProps)(BaseInfoGroup);
