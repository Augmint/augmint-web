import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import LoanList from "containers/loan/components/LoanList";
import LockList from "containers/lock/components/LockList";
import TransferList from "./components/TransferList";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";

import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import Button from "components/augmint-ui/button";

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
                    <TopNavTitlePortal>
                        <Pheader className="secondaryColor" header="My Account" />
                    </TopNavTitlePortal>

                    <Pgrid>
                        <div style={{ textAlign: "right", marginTop: 25, marginBottom: -15 }}>
                            <Button data-testid="transferButton" to="/exchange" className="primary">
                                Buy / Sell A-EUR
                            </Button>
                            <Button data-testid="transferButton" to="/transfer" className="primary">
                                Transfer A-EUR
                            </Button>
                        </div>
                        <TransferList
                            header="My A-EUR Account History"
                            transfers={this.props.userTransfers}
                            userAccount={this.props.userAccount}
                        />

                        <Pgrid.Row>
                            <Pgrid.Column size={{ phone: 1, tablet: 1 / 2 }}>
                                <LoanList
                                    header="My A-EUR Loans"
                                    noItemMessage={<span>You have no loans</span>}
                                    loans={this.props.loans}
                                />
                            </Pgrid.Column>
                            <Pgrid.Column size={{ phone: 1, tablet: 1 / 2 }}>
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
