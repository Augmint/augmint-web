import React from "react";
import { Pblock } from "components/PageLayout";
import { MyListGroup, MyGridTable, MyGridTableRow as Row, MyGridTableColumn as Col } from "components/MyListGroups";
import { ErrorPanel } from "components/MsgPanels";
import { MoreInfoTip } from "components/ToolTip";

export default class TransferList extends React.Component {
    render() {
        const { filter, header, noItemMessage, userAccountAddress } = this.props;
        const { transfers, isLoading, error } = this.props.transfers;
        const listItems =
            transfers &&
            transfers.filter(filter).map((tx, index) => (
                <MyListGroup.Row
                    key={`txRowDiv-${tx.blockNumber}-${tx.transactionIndex}-${tx.logIndex}-${tx.directionText}`}
                >
                    <MyGridTable
                        divided={false}
                        key={`txTableDiv-${tx.blockNumber}-${tx.transactionIndex}-${tx.logIndex}-${tx.directionText}`}
                    >
                        <Row columns={1}>
                            <Col>
                                {tx.args.from.toLowerCase() === userAccountAddress.toLowerCase()
                                    ? "To: " + tx.args.to
                                    : "From: " + tx.args.from}{" "}
                                <MoreInfoTip header="Transaction details">
                                    blockNumber: {tx.blockNumber}
                                    <br />blockHash: <small>{tx.blockHash}</small>
                                    <br />Block timestamp: {tx.blockData.timestamp} {typeof tx.blockData.timestamp}
                                    <br />transactionIndex: {tx.transactionIndex}
                                    <br />transaction hash: <small>{tx.transactionHash}</small>
                                </MoreInfoTip>
                            </Col>
                        </Row>
                        <Row columns={3}>
                            <Col>Amount: {tx.signedAmount} A-EUR</Col>
                            <Col>Fee: {tx.senderFee} A-EUR</Col>
                            <Col>on {tx.blockTimeStampText}</Col>
                        </Row>

                        {tx.args.narrative && (
                            <Row columns={1}>
                                <Col>{tx.args.narrative}</Col>
                            </Row>
                        )}
                    </MyGridTable>
                </MyListGroup.Row>
            ));

        return (
            <Pblock loading={isLoading} header={header}>
                {error && <ErrorPanel header="Error while fetching transfer list">{error.message}</ErrorPanel>}
                {transfers == null && !isLoading && <p>Connecting...</p>}
                {isLoading && <p>Refreshing transaction list...</p>}
                {transfers && (
                    <MyListGroup id="transferListDiv">{listItems.length === 0 ? noItemMessage : listItems}</MyListGroup>
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
    header: "A-EUR transfer history"
};
