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

    return (
        <Pblock header="Orders">
            <ArrayDump items={props.orders} />
            <Button size="small" onClick={handleRefreshClick} disabled={!props.orders || props.orders.isLoading}>
                Refresh orders
            </Button>
        </Pblock>
    );
}
