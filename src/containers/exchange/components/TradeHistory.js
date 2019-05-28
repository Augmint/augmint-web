import React from "react";
import moment from "moment";

import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import styled from "styled-components";
import { Table } from "components/Table";

import { ETHEUR } from "utils/constants";
import { AEUR, ETH, Percent } from "components/augmint-ui/currencies";

const TradeTable = styled(Table)`
    tr :nth-child(1),
    tr :nth-child(5),
    tr :nth-child(6),
    tr :nth-child(7),
    tr :nth-child(8) {
        text-align: right;
    }
`;

export default class TradeHistory extends React.Component {
    render() {
        const { header } = this.props;
        const { trades, error, isLoading } = this.props.trades;

        return (
            <Pblock loading={isLoading} header={header} style={{ overflow: "auto" }}>
                {error && <ErrorPanel header="Error while fetching trade list">{error.message}</ErrorPanel>}
                {trades == null && !isLoading && <p>Connecting...</p>}
                {!error && isLoading && <p>Refreshing orders...</p>}
                {trades && trades.length === 0 && (
                    <p data-testid="trade-history" data-test-historycount="0">
                        You have no trades yet
                    </p>
                )}
                {trades && trades.length > 0 && (
                    <TradeTable data-testid="trade-history" data-test-historycount={trades.length}>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Type</th>
                                <th>Order ID</th>
                                <th>Direction</th>
                                <th>Price</th>
                                <th>ETH amount</th>
                                <th>A€ amount</th>
                                <th>{ETHEUR} rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trades.map((trade, index) => (
                                <tr key={index}>
                                    <td>{moment.unix(trade.timestamp).format("D MMM YYYY HH:mm")}</td>
                                    <td>{trade.type}</td>
                                    <td>{trade.orderId}</td>
                                    <td>{trade.direction}</td>
                                    <td>
                                        <Percent amount={trade.price} />
                                    </td>
                                    <td>
                                        <ETH amount={trade.weiAmount} />
                                    </td>
                                    <td>
                                        <AEUR amount={trade.tokenAmount} />
                                    </td>
                                    <td>
                                        <AEUR amount={trade.effectiveRate} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </TradeTable>
                )}
            </Pblock>
        );
    }
}
