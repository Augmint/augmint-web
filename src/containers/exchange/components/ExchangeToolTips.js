import React from "react";
import ToolTip from "components/toolTip";

export function NoOrdersToolTip(props) {
    return (
        <ToolTip header="No open orders" id={"no_orders_tooltip"}>
            There are no sell or buy A-EUR orders. You can still place an order.
            <br />
            You can always cancel your order.
        </ToolTip>
    );
}

export function PriceToolTip(props) {
    return (
        <ToolTip header="Order price" id={"price_tooltip"}>
            % of published ETH/EUR price. <br /> The actual price will be calculated based on the rate published by
            Augmint at the time of the matching executed. The published price is calculated as an avarage rate from
            multiple exchanges.
        </ToolTip>
    );
}
