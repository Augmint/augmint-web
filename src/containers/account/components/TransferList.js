import React from "react";
import { TxDate, TxTitle, TxDetails, TxPrice } from "components/transaction";
import { ErrorPanel } from "components/MsgPanels";
import HashURL from "components/hash";
import { StyleTitle, StyleTable, StyleThead, StyleTbody, StyleTd, StyleTh, StyleTr } from "components/Table/style";

export default class TransferList extends React.Component {
    render() {
        const { filter, header, noItemMessage, userAccount } = this.props;
        const { transfers, isLoading, error } = this.props.transfers;

        const transferItems =
            transfers &&
            transfers
                .filter(filter)
                .map((tx, index, all) => {
                    tx.balance =
                        index > 0
                            ? Math.round(all[index - 1].balance * 100 - all[index - 1].signedAmount * 100) / 100
                            : userAccount.tokenBalance;
                    return tx;
                })
                .map(tx => {
                    return {
                        data: tx,
                        key: `${tx.blockNumber}-${tx.transactionIndex}-${tx.logIndex}-${tx.directionText}`,
                        date: (
                            <div>
                                <TxDate>{tx.blockTimeStampText}</TxDate>
                            </div>
                        ),
                        title: (
                            <div>
                                <TxTitle>{tx.direction < 0 ? "Outgoing transfer" : "Incoming transfer"}</TxTitle>
                                <TxDetails data-testid="txDetails">
                                    {tx.args.narrative} <HashURL hash={tx.transactionHash} title={"» Details"} />
                                </TxDetails>
                            </div>
                        ),
                        amount: (
                            <div>
                                <TxPrice className={`${tx.direction < 0 ? "minus" : "plus"}`} data-testid="txPrice">
                                    {tx.direction < 0 ? "-" : "+"} {Math.abs(tx.signedAmount)} A€
                                </TxPrice>
                                <br />
                                <TxPrice>
                                    <small data-testid="txFee">
                                        - {tx.senderFee}
                                        <small> A€ fee</small>
                                    </small>
                                </TxPrice>
                            </div>
                        ),
                        balance: (
                            <div>
                                <TxPrice>{tx.balance} A€</TxPrice>
                            </div>
                        )
                    };
                });

        return (
            <div style={{ color: "black" }}>
                {header && <StyleTitle>{header}</StyleTitle>}
                {error && <ErrorPanel header="Error while fetching transfer list">{error.message}</ErrorPanel>}
                {transfers == null && !isLoading && <p>Connecting...</p>}
                {isLoading && <p>Refreshing transaction list...</p>}
                {!transferItems ? (
                    noItemMessage
                ) : (
                    <StyleTable>
                        <StyleThead>
                            <StyleTr>
                                <StyleTh>Date</StyleTh>
                                <StyleTh>Transaction</StyleTh>
                                <StyleTh style={{ textAlign: "right" }}>Amount</StyleTh>
                                <StyleTh style={{ textAlign: "right" }}>Balance</StyleTh>
                            </StyleTr>
                        </StyleThead>
                        <StyleTbody>
                            {transferItems.map(tx => (
                                <StyleTr
                                    key={`txRow-${tx.key}`}
                                    data-testid={`transferListItem-${tx.data.transactionHash}`}
                                >
                                    <StyleTd>{tx.date}</StyleTd>
                                    <StyleTd>{tx.title}</StyleTd>
                                    <StyleTd style={{ textAlign: "right" }}>{tx.amount}</StyleTd>
                                    <StyleTd style={{ textAlign: "right" }}>{tx.balance}</StyleTd>
                                </StyleTr>
                            ))}
                        </StyleTbody>
                    </StyleTable>
                )}
            </div>
        );
    }
}

TransferList.defaultProps = {
    transfers: null,
    userAccount: null,
    filter: () => {
        return true; // no filter passed
    },
    noItemMessage: <p>No transactions</p>,
    header: "A-EUR transfer history"
};
