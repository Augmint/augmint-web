import React from "react";
import { connect } from "react-redux";
import { StyleTable, StyleThead, StyleTbody, StyleTd, StyleTh, StyleTr } from "components/Table/style";
import Segment from "components/augmint-ui/segment";
import { setupTopicWatch, startRepeating } from "modules/augmintTxProvider";

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
                            <StyleTh className={"hide-xs"}>Hash</StyleTh>
                            <StyleTh>From</StyleTh>
                            <StyleTh>To</StyleTh>
                            <StyleTh style={{ textAlign: "right" }}>Amount</StyleTh>
                            <StyleTh style={{ textAlign: "right" }}>Status</StyleTh>
                        </StyleTr>
                    </StyleThead>
                    <StyleTbody>
                        {transfers.map(tx => (
                            <StyleTr key={`txRow-${tx.hash}`} data-testid={`transferListItem-${tx.hash}`}>
                                <StyleTd className={"hide-xs"}>{tx.hash}</StyleTd>
                                <StyleTd>{tx.payload.from}</StyleTd>
                                <StyleTd>{tx.payload.to}</StyleTd>
                                <StyleTd style={{ textAlign: "right" }} className={"hide-xs"}>
                                    {tx.payload.amount}
                                </StyleTd>
                                <StyleTd style={{ textAlign: "right" }} className={"hide-xs"}>
                                    Status
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
