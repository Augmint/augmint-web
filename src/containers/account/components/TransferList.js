import React from "react";
import { Pblock } from "components/PageLayout";
import { MyListGroup, MyListGroupItem } from "components/MyListGroups";
import ErrorDetails from "components/ErrorDetails";

export default class TransferList extends React.Component {
    render() {
        const {
            filter,
            header,
            noItemMessage,
            userAccountAddress
        } = this.props;
        const { transfers, isLoading, error } = this.props.transfers;
        const listItems =
            transfers !== null &&
            transfers.filter(filter).map((tx, index) => (
                <MyListGroupItem
                    key={`txDiv-${tx.blockNumber}-${tx.transactionIndex}-${tx.logIndex}-${tx.direction}`}
                >
                    {tx.from !== userAccountAddress && <p>From: {tx.from}</p>}
                    {tx.to !== userAccountAddress && <p>To: {tx.to}</p>}
                    <p>Amount: {tx.amount} UCD</p>
                    <p>{tx.blockTimeStampText}</p>
                    {tx.narrative && <p>{tx.narrative}</p>}
                    <small>
                        <p>
                            blockNumber: {tx.blockNumber} | transactionIndex:{" "}
                            {tx.transactionIndex} | type: {tx.type}
                        </p>
                    </small>
                </MyListGroupItem>
            ));

        return (
            <Pblock header={header}>
                {error && (
                    <p>
                        Error while fetching transfer list
                        <ErrorDetails>{error.message}</ErrorDetails>
                    </p>
                )}
                {transfers == null && !isLoading && <p>Connecting...</p>}
                {isLoading && <p>Refreshing transaction list...</p>}
                {transfers != null && listItems.length === 0 ? (
                    noItemMessage
                ) : (
                    <MyListGroup>{listItems}</MyListGroup>
                )}
            </Pblock>
        );
    }
}

TransferList.defaultProps = {
    transfers: null,
    userAccountAddress: null,
    filter: () => {
        return true; // no filter passed
    },
    noItemMessage: <p>No transactions</p>,
    header: "UCD transfer history"
};
