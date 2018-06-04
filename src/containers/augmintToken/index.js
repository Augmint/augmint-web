import React from "react";
import { bindActionCreators } from "redux"; // TODO: do we really need this or shall we use the store directly?
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
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
import Button from "components/augmint-ui/button";

import TopNavTitlePortal from 'components/portals/TopNavTitlePortal';
import { FeatureContext } from "modules/services/featureService";

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
                    <TopNavTitlePortal>
                        <FeatureContext>
                            {features => features.dashboard ? <Pheader className="secondaryColor" header="Reserves" /> : null}
                        </FeatureContext>
                    </TopNavTitlePortal>
                    <Pgrid.Row>
                        <Pgrid.Column>
                            <TotalSupply
                                augmintToken={this.props.augmintToken}
                                monetarySupervisor={this.props.monetarySupervisor}
                            />
                        </Pgrid.Column>
                        <TopNavTitlePortal>
                            <FeatureContext>
                                {features => features.dashboard ? null : <Pheader header="Reserves" style={{ width: "100%" }} />}
                            </FeatureContext>
                        </TopNavTitlePortal>
                        <Pgrid.Column>
                            <ReserveStats
                                augmintToken={this.props.augmintToken}
                                monetarySupervisor={this.props.monetarySupervisor}
                                rates={this.props.rates}
                            />
                        </Pgrid.Column>

                        <Pheader header="Loans & Locks" style={{ width: "100%" }} />
                        <Pgrid.Column>
                            <LtdStats
                                monetarySupervisor={this.props.monetarySupervisor}
                                loanManager={this.props.loanManager}
                                lockManager={this.props.lockManager}
                            />
                            <Button
                                content="Loans to Collect"
                                data-testid="loansToCollectButton"
                                to="/loan/collect"
                                icon="angle-right"
                                labelposition="right"
                                size="large"
                            />
                        </Pgrid.Column>

                        <Pheader header="Earnings" style={{ marginTop: "1em", width: "100%" }} />
                        <Pgrid.Column>
                            <EarningStats
                                monetarySupervisor={this.props.monetarySupervisor}
                                augmintToken={this.props.augmintToken}
                            />
                        </Pgrid.Column>
                    </Pgrid.Row>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
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
