import React from "react";
import { connect } from "react-redux";
import store from "modules/store";
import { fetchLatestTransfers } from "modules/reducers/userTransfers";
import { TxDate, TxInfo } from "components/transaction";
import { ErrorPanel } from "components/MsgPanels";
import { StyleTitle, StyleTable, StyleThead, StyleTbody, StyleTd, StyleTh, StyleTr } from "components/Table/style";
import Segment from "components/augmint-ui/segment";
import Button from "components/augmint-ui/button";
import { calculateTransfersBalance } from "modules/ethereum/transferTransactions";
import { AEUR } from "components/augmint-ui/currencies";
import styled from "styled-components";
import { default as theme } from "styles/theme";

const Transfer = styled.span`
    .positive::before {
        content: "+";
    }

    .delta.positive {
        color: ${theme.colors.green};
    }

    .delta.negative {
        color: ${theme.colors.red};
    }

    .feeOrBounty {
        font-size: smaller;
        display: block;

        &.zero {
            display: none;
        }

        &.positive::after {
            content: " bounty";
        }

        &.negative::after {
            content: " fee";
        }
    }
`;

class TransferList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { page: 1 };
        this.showMore = this.showMore.bind(this);
    }

    showMore() {
        const currentLimit = this.state.page * this.props.limit;
        const page = this.state.page + 1;
        const limit = page * this.props.limit;
        const nextPage = () => {
            this.setState({ page });
        };
        const fetchData = () => {
            store.dispatch(fetchLatestTransfers(this.props.userAccount.address, true)).then(res => {
                if (res.type === "userTransfers/FETCH_TRANSFERS_RECEIVED") {
                    if (this.isLastPage() || currentLimit <= res.result.length) {
                        nextPage();
                    } else {
                        if (res.fetchedLength === 0) {
                            fetchData();
                        }
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

            calculateTransfersBalance(transfers, userAccount.tokenBalance * 100);

            transfers = transfers.map(tx => {
                return {
                    data: tx,
                    key: `${tx.blockNumber}-${tx.key}`,
                    date: <TxDate>{tx.blockTimeStampText}</TxDate>,
                    info: <TxInfo tx={tx} />,
                    amount: (
                        <Transfer>
                            <AEUR raw amount={tx.amount} className="delta" data-testid="txPrice" />
                            <AEUR raw amount={tx.fee} className="feeOrBounty" data-testid="txFee" />
                        </Transfer>
                    ),
                    balance: <AEUR raw amount={tx.balance} />
                };
            });
        }

        return (
            <Segment loading={isLoading && !transfers} style={{ color: "black" }}>
                {header && <StyleTitle>{header}</StyleTitle>}
                {error && <ErrorPanel header="Error while fetching transfer list">{error.message}</ErrorPanel>}
                {!transfers || transfers.length === 0 ? (
                    noItemMessage
                ) : (
                    <div style={{ overflow: "auto" }}>
                        <StyleTable>
                            <StyleThead>
                                <StyleTr>
                                    <StyleTh className={"hide-xs"}>Date</StyleTh>
                                    <StyleTh style={{ textAlign: "right" }}>Transaction</StyleTh>
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
                    </div>
                )}
                {transfers && !this.isLastPage() && (
                    <div style={{ marginTop: 20, paddingLeft: 20, marginBottom: 20 }}>
                        <Segment loading={isLoading} style={{ color: "black", display: "inline-block" }}>
                            <Button onClick={this.showMore} className="ghost" tabIndex="0">
                                Show older
                            </Button>
                        </Segment>
                    </div>
                )}
            </Segment>
        );
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userAccount !== this.props.userAccount) {
            this.setState({ page: 1 });
        }
    }
}

TransferList.defaultProps = {
    userAccount: null,
    noItemMessage: <p style={{ paddingLeft: 20 }}>No recent transactions found.</p>,
    header: null,
    limit: 5
};

const mapStateToProps = state => ({
    userTransfers: state.userTransfers
});

export default connect(mapStateToProps)(TransferList);
