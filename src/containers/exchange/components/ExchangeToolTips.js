import React from "react";
//import {Popover, Glyphicon, OverlayTrigger} from 'react-bootstrap';
import ToolTip from "components/ToolTip";

export function NoOrdersToolTip(props) {
    return (
        <ToolTip title="No open orders">
            There are no sell or buy UCD orders. You can still place an order.<br />
            It will be filled on the UCD/ETH rate when someone places a matching
            order.<br />
            TO BE IMPLEMNTED: You can always cancel your order.
        </ToolTip>
    );
}
