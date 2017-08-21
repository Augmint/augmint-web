import React from "react";
import store from "modules/store";
import { refreshOrders } from "modules/reducers/orders";
import { Panel, Button } from "react-bootstrap";
import { ArrayDump } from "./ArrayDump";

export function OrdersInfo(props) {
    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshOrders());
    };

    return (
        <Panel header={<h3>Orders</h3>}>
            <ArrayDump items={props.orders} />
            <Button
                bsSize="small"
                onClick={handleRefreshClick}
                disabled={!props.orders || props.orders.isLoading}
            >
                Refresh orders
            </Button>
        </Panel>
    );
}
