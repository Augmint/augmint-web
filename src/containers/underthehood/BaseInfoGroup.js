import React from "react";
import { connect } from "react-redux";
import augmintTokenProvider from "modules/augmintTokenProvider";
import Web3ConnectionInfo from "./components/Web3ConnectionInfo";
import ContractConnectionsInfo from "./components/ContractConnectionsInfo";
import { UserAccountInfo } from "./components/UserAccountInfo";
import { SystemInfo } from "./components/SystemInfo";
import HWWallets from "./components/HWWallets";
import { ArrayDump } from "./components/ArrayDump";
import { Pgrid } from "components/PageLayout";

class BaseInfoGroup extends React.Component {
    componentDidMount() {
        augmintTokenProvider();
    }

    render() {
        return (
            <Pgrid.Row>
                <Pgrid.Column size={{ phone: 1, tablet: 1 / 2, desktop: 1 / 3 }}>
                    <Web3ConnectionInfo web3Connect={this.props.web3Connect} />
                    <ContractConnectionsInfo contracts={this.props.contracts} />
                </Pgrid.Column>
                <Pgrid.Column size={{ phone: 1, tablet: 1 / 2, desktop: 1 / 3 }}>
                    <UserAccountInfo userBalances={this.props.userBalances} />
                    <SystemInfo />
                </Pgrid.Column>
                <Pgrid.Column size={{ phone: 1, tablet: 1 / 2, desktop: 1 / 3 }}>
                    <ArrayDump header="Accounts" items={this.props.accounts} />
                    <HWWallets />
                </Pgrid.Column>
            </Pgrid.Row>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    augmintToken: state.augmintToken,
    monetarySupervisor: state.monetarySupervisor,
    userBalances: state.userBalances,
    accounts: state.web3Connect.accounts,
    contracts: state.contracts
});

export default connect(mapStateToProps)(BaseInfoGroup);
