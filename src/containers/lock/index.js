import React from "react";
import { connect } from "react-redux";


import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import { EthereumState } from "containers/app/EthereumState";

import { Pcontainer, Pblock, Pgrid } from "components/PageLayout";
import AccountInfo from "components/AccountInfo";
import Button from "components/button";
import LockForm from "./containers/LockForm";

import { StyledButtonContainer } from "./styles";


class LockContainer extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
    }

    render() {
        const { userAccount } = this.props;

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
                        loading={false}
                        header="Lock"
                        style={{maxWidth: '500px'}}
                    >
                        <LockForm />
                    </Pblock>
                </EthereumState>
            </Pcontainer>
        );
    }
}

const mapStateToProps = state => {
    return {
        userAccount: state.userBalances.account
    }
};

export default connect(mapStateToProps)(LockContainer);