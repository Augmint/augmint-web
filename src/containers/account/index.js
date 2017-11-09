import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import tokenUcdProvider from "modules/tokenUcdProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import AccountInfo from "components/AccountInfo";
import LoanList from "containers/loan/components/LoanList";
import UcdTransferForm from "./UcdTransferForm";
import TransferList from "./components/TransferList";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";

class AccountHome extends React.Component {
    componentDidMount() {
        connectWeb3();
        loanManagerProvider();
        tokenUcdProvider();
    }
    render() {
        return (
            <EthereumState>
                <Psegment>
                    <Pheader header="My Account" />

                    <Pgrid>
                        <Pgrid.Row columns={2}>
                            <Pgrid.Column>
                                <AccountInfo
                                    account={this.props.userAccount}
                                    header="Overview"
                                />

                                <UcdTransferForm />

                                <TransferList
                                    transfers={this.props.userTransfers}
                                    userAccountAddress={
                                        this.props.userAccount.address
                                    }
                                />
                            </Pgrid.Column>

                            <Pgrid.Column>
                                <LoanList
                                    header="My ACD Loans"
                                    noItemMessage={
                                        <span>You have no loans</span>
                                    }
                                    loans={this.props.loans}
                                />
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
    loans: state.loans.loans,
    userTransfers: state.userTransfers
});

export default connect(mapStateToProps)(AccountHome);
