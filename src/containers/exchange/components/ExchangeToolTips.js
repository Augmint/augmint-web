import React from "react";
import ToolTip from "components/ToolTip";

export function NoOrdersToolTip(props) {
    return (
        <ToolTip header="No open orders">
            There are no sell or buy ACE orders. You can still place an order.<br />
            It will be filled on the EUR/ETH rate when someone places a matching order.<br />
            TO BE IMPLEMENTED: You can always cancel your order.
        </ToolTip>
    );
}
