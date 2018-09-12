import React from "react";
import { connect } from "react-redux";

import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import loanManagerProvider from "modules/loanManagerProvider";

import { EthereumState } from "containers/app/EthereumState";

import { Psegment, Pgrid, Pheader } from "components/PageLayout";
import Button from "components/augmint-ui/button";
import LockForm from "./containers/LockForm";

import TopNavTitlePortal from "components/portals/TopNavTitlePortal";

import { StyledButtonContainer } from "./styles";

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
                    <Pgrid>
                        <Pgrid.Row wrap={false}>
                            <Pgrid.Column>
                                <StyledButtonContainer>
                                    <Button to="/exchange">Buy A€</Button>
                                </StyledButtonContainer>
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
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
