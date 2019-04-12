import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { Pgrid, Pheader, Psegment } from "components/PageLayout";
import augmintTokenProvider from "modules/augmintTokenProvider";
import AddWithdrawForm from "./components/AddWithdrawForm";
import { EthereumState } from "containers/app/EthereumState";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import NoTokenAlert from "../account/components/NoTokenAlert";

class WithdrawHome extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
    }

    render() {
        const { userAccount } = this.props;

        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Add / Withdraw funds" />
                    </TopNavTitlePortal>

                    <NoTokenAlert style={{ margin: "0 15px 5px" }} />
                    <Pgrid>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2, desktop: 6 / 16 }}>
                                <AddWithdrawForm user={userAccount} />
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
    userAccount: state.userBalances.account
});

export default connect(mapStateToProps)(WithdrawHome);
