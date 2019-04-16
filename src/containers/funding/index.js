import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { Pgrid, Pheader, Psegment } from "components/PageLayout";
import augmintTokenProvider from "modules/augmintTokenProvider";
import ratesProvider from "modules/ratesProvider";
import AddWithdrawForm from "./components/AddWithdrawForm";
import { EthereumState } from "containers/app/EthereumState";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import NoTokenAlert from "../account/components/NoTokenAlert";

import "./styles.css";

class WithdrawHome extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        ratesProvider();
    }

    render() {
        const { userAccount, rates } = this.props;

        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Add / withdraw funds" />
                    </TopNavTitlePortal>

                    <NoTokenAlert style={{ margin: "0 15px 5px" }} />
                    <Pgrid id="funding">
                        <Pgrid.Row className="row">
                            <Pgrid.Column className="column" size={{ mobile: 1, tablet: 1, desktop: 2 / 5 }}>
                                <AddWithdrawForm user={userAccount} rates={rates} />
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    userAccount: state.userBalances.account,
    rates: state.rates
});

export default connect(mapStateToProps)(WithdrawHome);
