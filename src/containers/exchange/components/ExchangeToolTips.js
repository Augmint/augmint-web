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
    return (
        <ToolTip header="Order price">
            % of published EUR/ETH price.<br />
            E.g.: An order on 101% price will fill on 1,010 EUR/ETH price if the published rate is 1,000 EUR/ETH at the
            moment of the matching.
        </ToolTip>
    );
}
