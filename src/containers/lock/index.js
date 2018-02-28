import React from "react";
import { connect } from "react-redux";

import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import { EthereumState } from "containers/app/EthereumState";

import { Pcontainer } from "components/PageLayout";
import AccountInfo from "components/AccountInfo";
import LockForm from "./containers/LockForm";

class LockContainer extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
    }

    render() {
        const { userAccount } = this.props;

        return (
            <Pcontainer>
                <EthereumState>
                    <AccountInfo account={userAccount} header="Balance" />
                    <LockForm />
                </EthereumState>
            </Pcontainer>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
});

export default connect(mapStateToProps)(LockContainer);