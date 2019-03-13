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
import { watchAsset } from "modules/watchAsset.js";
import Icon from "components/augmint-ui/icon";

class AccountHome extends React.Component {
    componentDidMount() {
        connectWeb3();
        loanManagerProvider();
        lockManagerProvider();
        augmintTokenProvider();
    }
    render() {
        const web3 = this.props.web3;
        let isMetamask = null;
        if (web3 && web3.web3Instance) {
            const metamask = web3.web3Instance.currentProvider._metamask;
            isMetamask = metamask ? metamask.isEnabled() : null;
        }
        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="My Account" />
                    </TopNavTitlePortal>

                    <NoTokenAlert style={{ margin: "0 15px 5px" }} />
                    <Pgrid>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ tablet: 2 / 5 }}>
                                <Balance
                                    userAccount={this.props.userAccount}
                                    loans={this.props.loans}
                                    locks={this.props.locks}
                                >
                                    <div style={{ marginTop: "25px" }}>
                                        {isMetamask && this.props.userAccount.tokenBalance && (
                                            <Button
                                                className="primary"
                                                style={{ padding: "15px" }}
                                                onClick={() => {
                                                    watchAsset();
                                                }}
                                            >
                                                <Icon style={{ marginRight: "7px" }} name="plus" />
                                                Add A€ asset to your wallet
                                            </Button>
                                        )}
                                    </div>
                                </Balance>
                            </Pgrid.Column>
                            <Pgrid.Column size={{ tablet: 3 / 5 }}>
                                <div style={{ textAlign: "right" }}>
                                    <Button to="/exchange" className="primary">
                                        Buy / Sell A-EUR
                                    </Button>
                                    <Button to="/transfer" className="primary" data-testid="transferButton">
                                        Transfer A-EUR
                                    </Button>
                                </div>
                            </Pgrid.Column>
                        </Pgrid.Row>

                        <Pgrid.Row>
                            <Pgrid.Column>
                                <TransferList userAccount={this.props.userAccount} header="My account history" />
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
    locks: state.locks,
    web3: state.web3Connect
});

export default connect(mapStateToProps)(AccountHome);
