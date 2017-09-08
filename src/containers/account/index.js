import React from "react";
import { connect } from "react-redux";
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
        loanManagerProvider();
        tokenUcdProvider();
    }
    render() {
        return (
            <Psegment>
                <EthereumState />

                <Pheader header="My Account" />

                <Pgrid>
                    <Pgrid.Row columns={2}>
                        <Pgrid.Column>
                            <Pgrid.Column>
                                <AccountInfo
                                    account={this.props.userAccount}
                                    header="Overview"
                                />
                            </Pgrid.Column>
                            <Pgrid.Column>
                                <UcdTransferForm />
                            </Pgrid.Column>
                            <Pgrid.Column>
                                <TransferList
                                    transfers={this.props.userTransfers}
                                    userAccountAddress={
                                        this.props.userAccount.address
                                    }
                                />
                            </Pgrid.Column>
                        </Pgrid.Column>

                        <Pgrid.Column>
                            <LoanList
                                header="My UCD Loans"
                                noItemMessage={<span>You have no loans</span>}
                                loans={this.props.loans}
                            />
                        </Pgrid.Column>
                    </Pgrid.Row>
                </Pgrid>
            </Psegment>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    loans: state.loans.loans,
    userTransfers: state.userTransfers
});

export default connect(mapStateToProps)(AccountHome);
