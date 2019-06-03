import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import LoanList from "containers/loan/components/LoanList";
import LockList from "containers/lock/components/LockList";
import Balance from "./components/Balance";
import TransferList from "./components/TransferList";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import Button from "components/augmint-ui/button";
import NoTokenAlert from "./components/NoTokenAlert";
import WatchAssetButton from "components/watchAssetButton";

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
                        <Pheader header="My Account" />
                    </TopNavTitlePortal>

                    <NoTokenAlert style={{ margin: "10px 15px 5px" }} />
                    <Pgrid>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2 }}>
                                <Balance
                                    userAccount={this.props.userAccount}
                                    loans={this.props.loans}
                                    locks={this.props.locks}
                                />
                            </Pgrid.Column>
                        </Pgrid.Row>

                        <Pgrid.Row>
                            <Pgrid.Column>
                                <TransferList userAccount={this.props.userAccount} />
                            </Pgrid.Column>
                        </Pgrid.Row>

                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2 }}>
                                <LoanList header="My active loans" loans={this.props.loans} />
                            </Pgrid.Column>
                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2 }}>
                                <LockList header="My active locks" locks={this.props.locks} />
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
    locks: state.locks
});

export default connect(mapStateToProps)(AccountHome);
