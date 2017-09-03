import React from "react";
import { connect } from "react-redux";
import { Row, Col, Panel } from "react-bootstrap";
import tokenUcdProvider from "modules/tokenUcdProvider";
import Web3ConnectionInfo from "./Web3ConnectionInfo";
import { TokenUcdInfo } from "./TokenUcdInfo";
import { UserAccountInfo } from "./UserAccountInfo";
import { ArrayDump } from "./ArrayDump";

class BaseInfoGroup extends React.Component {
    componentDidMount() {
        tokenUcdProvider();
    }

    render() {
        const {
            visible,
            web3Connect,
            userBalances,
            tokenUcd,
            accounts
        } = this.props;
        return !visible ? null : (
            <Row>
                <Col xs={12} sm={4}>
                    <Web3ConnectionInfo web3Connect={web3Connect} />
                    <UserAccountInfo userBalances={userBalances} />
                </Col>
                <Col xs={12} sm={4}>
                    <TokenUcdInfo contract={tokenUcd} />
                </Col>
                <Col xs={12} sm={4}>
                    <Panel header={<h3>Accounts</h3>}>
                        <ArrayDump items={accounts} />
                    </Panel>
                </Col>
            </Row>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    tokenUcd: state.tokenUcd,
    userBalances: state.userBalances,
    accounts: state.web3Connect.accounts
});

export default connect(mapStateToProps)(BaseInfoGroup);
