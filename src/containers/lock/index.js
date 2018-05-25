import React from "react";
import { connect } from "react-redux";

import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import lockManagerProvider from "modules/lockManagerProvider";

import { EthereumState } from "containers/app/EthereumState";

import { Psegment, Pgrid, Pheader } from "components/PageLayout";
import AccountInfo from "components/AccountInfo";
import Button from "components/augmint-ui/button";
import LockForm from "./containers/LockForm";

import { FeatureContext } from "modules/services/featureService";

import { StyledButtonContainer } from "./styles";

class LockContainer extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        lockManagerProvider();
    }

    render() {
        const { userAccount, lockManager, lockProducts } = this.props;

        return (
            <Psegment>
                <EthereumState>
                    <Pheader header="Lock A-EUR" />
                    <Pgrid>
                        <Pgrid.Row columns={2}>
                            <Pgrid.Column>
                                <AccountInfo account={userAccount} header="Balance" />
                            </Pgrid.Column>
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
                                <FeatureContext.Consumer>
                                    {features => <LockForm lockManager={lockManager} lockProducts={lockProducts} dashboard={features.dashboard} />}
                                </FeatureContext.Consumer>
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
        userAccount: state.userBalances.account,
        lockManager: state.lockManager,
        lockProducts: state.lockManager.products
    };
};

export default connect(mapStateToProps)(LockContainer);
