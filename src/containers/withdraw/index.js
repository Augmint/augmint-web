import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { Pheader, Psegment, Pgrid, Pblock } from "components/PageLayout";
import Header from "components/augmint-ui/header";
import exchangeProvider from "modules/exchangeProvider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import AddWithdrawForm from "./components/AddWithdrawForm";
import { EthereumState } from "containers/app/EthereumState";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import NoTokenAlert from "../account/components/NoTokenAlert";

class WithdrawHome extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        exchangeProvider();
    }

    render() {
        const { userAccount, exchange } = this.props;

        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Add & Withdraw funds" />
                    </TopNavTitlePortal>

                    <NoTokenAlert style={{ margin: "0 15px 5px" }} />
                    <Pgrid>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2, desktop: 1 / 3 }}>
                                <Pblock header="€ &harr; A€ on partner exchange">
                                    <Header />
                                </Pblock>
                                <AddWithdrawForm exchange={exchange} user={userAccount} />
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
    exchange: state.exchange,
    trades: state.trades
});

export default connect(mapStateToProps)(WithdrawHome);
