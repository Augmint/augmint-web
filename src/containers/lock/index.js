import React from "react";
import { connect } from "react-redux";

import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import loanManagerProvider from "modules/loanManagerProvider";

import { EthereumState } from "containers/app/EthereumState";

import { Psegment, Pgrid, Pheader } from "components/PageLayout";
import LockForm from "./containers/LockForm";

import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import NoTokenAlert from "../account/components/NoTokenAlert";

class LockContainer extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        lockManagerProvider();
        loanManagerProvider();
    }

    render() {
        const { lockManager, lockProducts } = this.props;

        return (
            <Psegment>
                <EthereumState>
                    <TopNavTitlePortal>
                        <Pheader header="Lock A-EUR" />
                    </TopNavTitlePortal>

                    <NoTokenAlert style={{ margin: "0 15px 5px" }} />
                    <Pgrid>
                        <Pgrid.Row columns={1}>
                            <Pgrid.Column>
                                <LockForm lockManager={lockManager} lockProducts={lockProducts} />
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                </EthereumState>
            </Psegment>
        );
    }
}

const mapStateToProps = state => {
    return {
        lockManager: state.lockManager,
        lockProducts: state.lockManager.products
    };
};

export default connect(mapStateToProps)(LockContainer);
