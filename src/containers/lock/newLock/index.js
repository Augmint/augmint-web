import React from "react";
// import { Route } from "react-router-dom";
import { connect } from "react-redux";
// import { connectWeb3 } from "modules/web3Provider";
// import augmintTokenProvider from "modules/augmintTokenProvider";
// import lockManagerProvider from "modules/lockManagerProvider";
// import loanManagerProvider from "modules/loanManagerProvider";
import LockForm from "../containers/LockForm";
import styled from "styled-components";

import { Pgrid, Pheader, Psegment } from "components/PageLayout";
import Button from "components/augmint-ui/button";
// import { StyledButtonContainer } from "./styles";

import TopNavTitlePortal from "components/portals/TopNavTitlePortal";

export const StyledButtonContainer = styled.div`
    display: flex;
    height: 100%;
    align-items: center;
`;

class NewLock extends React.Component {
    // componentDidMount() {
    //     connectWeb3();
    //     augmintTokenProvider();
    //     lockManagerProvider();
    //     loanManagerProvider();
    // }

    render() {
        const { lockManager, lockProducts } = this.props;

        return (
            <Psegment>
                {/*<EthereumState> -vszinu nem kell - parent componenetben lesz*/}
                <TopNavTitlePortal>
                    <Pheader header="Lock A-EUR" />
                </TopNavTitlePortal>
                {/* <Route exact path="/loan/new" component={LoanProductSelector} /> esetleg igy ha /lock-ot atalakitom? */}
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
                {/* </EthereumState> */}
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

export default connect(mapStateToProps)(NewLock);
