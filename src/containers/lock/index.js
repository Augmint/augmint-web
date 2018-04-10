import React from "react";
import { connect } from "react-redux";
import { SubmissionError } from "redux-form";

import store from "modules/store";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import { newLock, LOCKTRANSACTIONS_NEWLOCK_CREATED } from "modules/reducers/lockTransactions";
import { EthereumState } from "containers/app/EthereumState";

import { Pcontainer, Pblock, Pgrid } from "components/PageLayout";
import AccountInfo from "components/AccountInfo";
import Button from "components/button";
import LockForm from "./containers/LockForm";

import { StyledButtonContainer } from "./styles";

class LockContainer extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        lockManagerProvider();
    }

    async handleSubmit(values) {
        const res = await store.dispatch(newLock(values.productId, values.lockAmount));
        if (res.type !== LOCKTRANSACTIONS_NEWLOCK_CREATED) {
            throw new SubmissionError({
                _error: res.error
            });
        } else {
            this.setState({
                submitSucceeded: true,
                result: res.result
            });
            return res;
        }
    }

    render() {
        const { userAccount, lockManager, lockProducts } = this.props;

        return (
            <Pcontainer>
                <EthereumState>
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
                    <Pblock
                        testid="accountInfoBlock"
                        className="accountInfo"
                        loading={lockManager.isLoading}
                        header="Lock"
                        style={{ maxWidth: "700px" }}
                    >
                        <LockForm onSubmit={this.handleSubmit} lockProducts={lockProducts} />
                    </Pblock>
                </EthereumState>
            </Pcontainer>
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
