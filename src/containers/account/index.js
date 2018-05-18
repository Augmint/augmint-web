import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import AccountInfo from "components/AccountInfo";
import LoanList from "containers/loan/components/LoanList";
import LockList from "containers/lock/components/LockList";
import TokenTransferForm from "./TokenTransferForm";
import TransferList from "./components/TransferList";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";

class AccountHome extends React.Component {
    componentDidMount() {
        connectWeb3();
        loanManagerProvider();
        lockManagerProvider();
        augmintTokenProvider();
    }
    render() {
        return (
            <EthereumState>
                <Psegment>
                    <Pheader header="My Account" />

                    <Pgrid>
                        <Pgrid.Row wrap={false}>
                            <Pgrid.Column size={1 / 2}>
                                <AccountInfo account={this.props.userAccount} header="Overview" />

                                <TokenTransferForm />

                                <TransferList
                                    transfers={this.props.userTransfers}
                                    userAccountAddress={this.props.userAccount.address}
                                />
                            </Pgrid.Column>

                            <Pgrid.Column size={1 / 2}>
                                <LoanList
                                    header="My A-EUR Loans"
                                    noItemMessage={<span>You have no loans</span>}
                                    loans={this.props.loans}
                                />

                                <LockList header="My A-EUR Locks" locks={this.props.locks} />
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    loans: state.loans,
    locks: state.locks,
    userTransfers: state.userTransfers
});

export default connect(mapStateToProps)(AccountHome);
