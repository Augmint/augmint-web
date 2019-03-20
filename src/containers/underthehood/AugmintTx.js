import React from "react";
import { connect } from "react-redux";
import { StyleTable, StyleThead, StyleTbody, StyleTd, StyleTh, StyleTr } from "components/Table/style";
import Segment from "components/augmint-ui/segment";
import { setupTopicWatch, startRepeating } from "modules/augmintTxProvider";
import { decimalNumberConverter } from "utils/converter";
import { DECIMALS } from "utils/constants";
import moment from "moment";
import Button from "components/augmint-ui/button";

class AugmintTxList extends React.Component {
    componentDidMount() {
        setupTopicWatch();
        startRepeating();
    }

    render() {
        const isLoading = false;
        let transfers = this.props.messages;
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
                                Fee
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
                                        <i>{tx.payload.narrative}</i>
                                    </div>
                                    <hr />
                                    <div>
                                        <b>Last seen:</b>
                                        {tx.lastSeen.id} @{" "}
                                        {moment.unix(tx.lastSeen.date / 1000).format("D MMM YYYY HH:mm")}
                                    </div>
                                    <textarea defaultValue={JSON.stringify(tx)} />
                                    <hr />
                                    <div>{tx.statusText}</div>
                                    <div>
                                        <Button onClick={tx.transfer}>Transfer!</Button>
                                    </div>
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
    messages: state.augmintTx.messages
});

export default connect(mapStateToProps)(AugmintTxList);
