import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import TokenTransferForm from "./components/TokenTransferForm";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";

import TopNavTitlePortal from "components/portals/TopNavTitlePortal";

class TransferPage extends React.Component {
    componentDidMount() {
        connectWeb3();
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
                        <Pgrid.Row>
                            <Pgrid.Column size={{ phone: 1, tablet: 1 / 2 }}>
                                <TokenTransferForm />
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account
});

export default connect(mapStateToProps)(TransferPage);
