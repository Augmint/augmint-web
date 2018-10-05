import React from "react";
import { connect } from "react-redux";
import store from "modules/store";
import { fetchLatestTransfers } from "modules/reducers/userTransfers";
import { TxDate, TxInfo, TxPrice } from "components/transaction";
import { ErrorPanel } from "components/MsgPanels";
import { StyleTitle, StyleTable, StyleThead, StyleTbody, StyleTd, StyleTh, StyleTr } from "components/Table/style";
import Segment from "components/augmint-ui/segment";
import Button from "components/augmint-ui/button";

class TransferList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { page: 1 };
        this.showMore = this.showMore.bind(this);
    }

    showMore() {
        const page = this.state.page + 1;
        const limit = page * this.props.limit;
        const nextPage = () => {
            this.setState({ page });
        };
        const fetchData = () => {
            store.dispatch(fetchLatestTransfers(this.props.userAccount.address, true)).then(res => {
                if (res.type === "userTransfers/FETCH_TRANSFERS_RECEIVED") {
                    if (this.isLastPage() || limit <= res.result.length) {
                        nextPage();
                    } else {
                        fetchData();
                    }
                }
            });
        };

        if (limit < this.props.userTransfers.transfers.length) {
            nextPage();
        } else {
            fetchData();
        }
    }

    isLastPage() {
        return store.getState().contracts.latest.augmintToken.deployedAtBlock >= this.props.userTransfers.fromBlock;
    }

    render() {
        const { header, noItemMessage, userAccount } = this.props;
        const { isLoading, error } = this.props.userTransfers;
        let { transfers } = this.props.userTransfers;

        if (transfers) {
            transfers = transfers.slice(0, this.state.page * this.props.limit);

            transfers.reduce((balance, tx, index, all) => {
                const amount = index > 0 ? all[index - 1].signedAmount : 0;
                return (tx.balance = Math.round(balance * 100 - amount * 100) / 100);
            }, userAccount.tokenBalance || 0);

            transfers = transfers.map(tx => {
                return {
                    data: tx,
                    key: `${tx.blockNumber}-${tx.transactionIndex}-${tx.logIndex}-${tx.directionText}`,
                    date: <TxDate>{tx.blockTimeStampText}</TxDate>,
                    info: <TxInfo tx={tx} />,
                    amount: (
                        <span>
                            <TxPrice className={`${tx.direction < 0 ? "minus" : "plus"}`} data-testid="txPrice">
                                {tx.direction < 0 ? "-" : "+"} {Math.abs(tx.signedAmount).toFixed(2)} A€
                            </TxPrice>
                            {tx.senderFee > 0 && (
                                <TxPrice>
                                    <small data-testid="txFee">
                                        - {tx.senderFee.toFixed(2)}
                                        <small> A€ fee</small>
                                    </small>
                                </TxPrice>
                            )}
                        </span>
                    ),
                    balance: <TxPrice>{tx.balance.toFixed(2)} A€</TxPrice>
                };
            });
        }

        return (
            <Segment loading={isLoading} style={{ color: "black" }}>
                {header && <StyleTitle>{header}</StyleTitle>}
                {error && <ErrorPanel header="Error while fetching transfer list">{error.message}</ErrorPanel>}
                {!transfers || transfers.length === 0 ? (
                    noItemMessage
                ) : (
                    <StyleTable>
                        <StyleThead>
                            <StyleTr>
                                <StyleTh className={"hide-xs"}>Date</StyleTh>
                                <StyleTh>Transaction</StyleTh>
                                <StyleTh style={{ textAlign: "right" }}>Amount</StyleTh>
                                <StyleTh style={{ textAlign: "right" }} className={"hide-xs"}>
                                    Balance
                                </StyleTh>
                            </StyleTr>
                        </StyleThead>
                        <StyleTbody>
                            {transfers.map(tx => (
                                <StyleTr
                                    key={`txRow-${tx.key}`}
                                    data-testid={`transferListItem-${tx.data.transactionHash}`}
                                >
                                    <StyleTd className={"hide-xs"}>{tx.date}</StyleTd>
                                    <StyleTd>
                                        <div className={"show-xs"}>{tx.date}</div>
                                        {tx.info}
                                    </StyleTd>
                                    <StyleTd style={{ textAlign: "right" }}>
                                        {tx.amount}
                                        <div className={"show-xs"}>= {tx.balance}</div>
                                    </StyleTd>
                                    <StyleTd style={{ textAlign: "right" }} className={"hide-xs"}>
                                        {tx.balance}
                                    </StyleTd>
                                </StyleTr>
                            ))}
                        </StyleTbody>
                    </StyleTable>
                )}
                {transfers &&
                    !this.isLastPage() && (
                        <div style={{ marginTop: 20 }}>
                            <Button onClick={this.showMore} className="ghost">
                                Show older
                            </Button>
                        </div>
                    )}
            </Segment>
        );
    }
}

TransferList.defaultProps = {
    userAccount: null,
    noItemMessage: <p>There was nothing lately.</p>,
    header: null,
    limit: 5
};

const mapStateToProps = state => ({
    userTransfers: state.userTransfers
});

export default connect(mapStateToProps)(TransferList);
