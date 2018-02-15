import React from "react";
import ToolTip from "components/ToolTip";

export function NoOrdersToolTip(props) {
    return (
        <ToolTip header="No open orders">
            There are no sell or buy A-EUR orders. You can still place an order.<br />
            You can always cancel your order. TODO: more help
        </ToolTip>
    );
}

export function PriceToolTip(props) {
    return <ToolTip header="A-EUR / ETH price">TODO: explanation</ToolTip>;
}
