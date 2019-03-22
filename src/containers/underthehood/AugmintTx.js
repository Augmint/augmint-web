import React from "react";
import { connect } from "react-redux";
import { StyleTable, StyleThead, StyleTbody, StyleTd, StyleTh, StyleTr } from "components/Table/style";
import Segment from "components/augmint-ui/segment";
import { setupTopicWatch } from "modules/augmintTxProvider";
import { decimalNumberConverter } from "utils/converter";
import { DECIMALS } from "utils/constants";
import moment from "moment";
import Button from "components/augmint-ui/button";
import { MESSAGE_STATUS } from "../../delegatedTransfer";
import { transferTokenDelegatedTx } from "modules/ethereum/transferTransactions";

class AugmintTxList extends React.Component {
    componentDidMount() {
        setupTopicWatch();
    }

    transfer(tx) {
        transferTokenDelegatedTx(tx.payload, tx.signature);
    }

    renderButtonRow(tx, hasEth) {
        if (tx.status === MESSAGE_STATUS.WAITING) {
            if (hasEth) {
                return (
                    <div>
                        <hr />
                        <div>{tx.status}</div>
                        <div>
                            <Button onClick={() => this.transfer(tx)}>Transfer!</Button>
                        </div>
                    </div>
                );
            } else {
                return <div />;
            }
        } else {
            return (
                <div>
                    <hr />
                    <div>Completed!</div>
                </div>
            );
        }
    }

    render() {
        const isLoading = false;
        const { ethBalance } = this.props.userAccount;
        let transfers = this.props.messages;
        const hasEth = ethBalance > 0;
        return (
            <Segment loading={isLoading} style={{ color: "black" }}>
                <StyleTable>
                    <StyleThead>
                        <StyleTr>
                            <StyleTh className={"hide-xs"}>Message</StyleTh>
                            <StyleTh style={{ textAlign: "right" }}>Amount</StyleTh>
                            <StyleTh style={{ textAlign: "right" }}>
                                Maximum
                                <br />
                                Executor
                                <br />
                                Bounty
                            </StyleTh>
                        </StyleTr>
                    </StyleThead>
                    <StyleTbody>
                        {transfers.map(tx => (
                            <StyleTr key={`txRow-${tx.hash}`} data-testid={`transferListItem-${tx.hash}`}>
                                <StyleTd>
                                    <div>
                                        <b>Hash:</b>
                                        {tx.hash}
                                    </div>
                                    <div>
                                        <b>From:</b>
                                        {tx.payload.from}
                                    </div>
                                    <div>
                                        <b>To:</b>
                                        {tx.payload.to}
                                    </div>
                                    <div>
                                        <br />
                                        <i>{tx.payload.narrative}</i>
                                    </div>
                                    <hr />
                                    <div>
                                        <b>Last seen:</b>
                                        {tx.lastSeen.id} @{" "}
                                        {moment.unix(tx.lastSeen.date / 1000).format("D MMM YYYY HH:mm")}
                                    </div>
                                    <textarea defaultValue={JSON.stringify(tx)} />
                                    {this.renderButtonRow(tx, hasEth)}
                                </StyleTd>
                                <StyleTd style={{ textAlign: "right" }} className={"hide-xs"}>
                                    {decimalNumberConverter(tx.payload.amount, DECIMALS)}
                                </StyleTd>
                                <StyleTd style={{ textAlign: "right" }} className={"hide-xs"}>
                                    {decimalNumberConverter(tx.payload.maxExecutorFee, DECIMALS)}
                                </StyleTd>
                            </StyleTr>
                        ))}
                    </StyleTbody>
                </StyleTable>
            </Segment>
        );
    }
}

AugmintTxList.defaultProps = {
    messages: []
};

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    messages: state.augmintTx.messages
});

export default connect(mapStateToProps)(AugmintTxList);
