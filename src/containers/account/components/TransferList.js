import React from "react";
import { connect } from "react-redux";
import store from "modules/store";
import { fetchLatestTransfers } from "modules/reducers/userTransfers";
import { TxDate, TxInfo } from "components/transaction";
import { ErrorPanel } from "components/MsgPanels";
import { Table } from "components/Table";
import Header from "components/augmint-ui/header";
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

const TransferTable = styled(Table)`
    tr :nth-child(3),
    tr :nth-child(4) {
        text-align: right;
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
        }

        return (
            <Segment loading={isLoading && !transfers} style={{ color: "black" }}>
                {header && <Header>{header}</Header>}
                {error && <ErrorPanel header="Error while fetching transfer list">{error.message}</ErrorPanel>}
                {!transfers || transfers.length === 0 ? (
                    noItemMessage
                ) : (
                    <div style={{ overflow: "auto" }}>
                        <TransferTable>
                            <thead>
                                <tr>
                                    <th className={"hide-xs"}>Date</th>
                                    <th>Transaction</th>
                                    <th>Amount</th>
                                    <th className={"hide-xs"}>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfers.map(tx => (
                                    <tr key={`txRow-${tx.key}`} data-testid={`transferListItem-${tx.transactionHash}`}>
                                        <td className={"hide-xs"}>
                                            <TxDate>{tx.blockTimeStampText}</TxDate>
                                        </td>
                                        <td>
                                            <div className={"show-xs"}>{tx.date}</div>
                                            <TxInfo tx={tx} />
                                        </td>
                                        <td>
                                            <Transfer>
                                                <AEUR raw amount={tx.amount} className="delta" data-testid="txPrice" />
                                                <AEUR raw amount={tx.fee} className="feeOrBounty" data-testid="txFee" />
                                            </Transfer>
                                            <div className={"show-xs"}>
                                                = <AEUR raw amount={tx.balance} />
                                            </div>
                                        </td>
                                        <td className={"hide-xs"}>
                                            <AEUR raw amount={tx.balance} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </TransferTable>
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
