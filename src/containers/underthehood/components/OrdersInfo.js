import React from "react";
import store from "modules/store";
import { refreshOrders } from "modules/reducers/orders";
import { Pblock } from "components/PageLayout";
import { Button } from "semantic-ui-react";
import { ArrayDump } from "./ArrayDump";

export function OrdersInfo(props) {
    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshOrders());
    };
    console.log(props);
    return (
        <Pblock header="Orders">
            {props.orders
                ? [
                      <ArrayDump key="sellOrdersDump" items={props.orders.sellOrders} />,
                      <ArrayDump key="buyOrdersDump" items={props.orders.buyOrders} />
                  ]
                : "No orders loaded"}
            <Button size="small" onClick={handleRefreshClick} disabled={!props.orders || props.orders.isLoading}>
                Refresh orders
            </Button>
        </Pblock>
    );
}
