import React from "react";
import { bindActionCreators } from "redux"; // TODO: do we really need this or shall we use the store directly?
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { Link } from "react-router-dom";
import augmintTokenProvider from "modules/augmintTokenProvider";
import ratesProvider from "modules/ratesProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import { refreshAugmintToken } from "modules/reducers/augmintToken";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { ReserveStats } from "./components/ReserveStats";
import { TotalSupply } from "./components/TotalSupply";
import { LtdStats } from "./components/LtdStats";
import { EarningStats } from "./components/EarningStats";
import { EthereumState } from "containers/app/EthereumState";
import { Button } from "semantic-ui-react";

class AugmintToken extends React.Component {
    componentDidMount() {
        connectWeb3();
        ratesProvider();
        augmintTokenProvider();
        loanManagerProvider();
        lockManagerProvider();
    }

    handleAugmintTokenRefreshClick = e => {
        e.preventDefault();
        this.props.refreshAugmintToken();
    };

    render() {
        return (
            <EthereumState>
                <Psegment>
                    <Pgrid columns={1}>
                        <Pgrid.Column>
                            <TotalSupply
                                augmintToken={this.props.augmintToken}
                                monetarySupervisor={this.props.monetarySupervisor}
                            />
                        </Pgrid.Column>

                        <Pheader header="Reserves" />
                        <Pgrid.Column>
                            <ReserveStats
                                augmintToken={this.props.augmintToken}
                                monetarySupervisor={this.props.monetarySupervisor}
                                rates={this.props.rates}
                            />
                        </Pgrid.Column>

                        <Pheader header="Loans & Locks" />
                        <Pgrid.Column>
                            <LtdStats
                                monetarySupervisor={this.props.monetarySupervisor}
                                loanManager={this.props.loanManager}
                                lockManager={this.props.lockManager}
                            />
                            <Button
                                content="Loans to Collect"
                                as={Link}
                                data-testid="loansToCollectButton"
                                to="/loan/collect"
                                icon="right chevron"
                                labelPosition="right"
                                basic
                                size="large"
                            />
                        </Pgrid.Column>

                        <Pheader header="Earnings" />
                        <Pgrid.Column>
                            <EarningStats
                                monetarySupervisor={this.props.monetarySupervisor}
                                augmintToken={this.props.augmintToken}
                            />
                        </Pgrid.Column>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.web3Connect.userAccount,
    accounts: state.web3Connect.accounts,
    balance: state.web3Connect.balance,
    isLoading: state.web3Connect.isLoading,
    isConnected: state.web3Connect.isConnected,
    web3Instance: state.web3Connect.web3Instance,

    augmintToken: state.augmintToken,
    loanManager: state.loanManager,
    lockManager: state.lockManager,
    monetarySupervisor: state.monetarySupervisor,
    rates: state.rates
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            refreshAugmintToken
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(AugmintToken);
