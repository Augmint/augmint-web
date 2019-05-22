import React from "react";
import ToolTip from "components/toolTip";
import { ETHEUR } from "utils/constants";

export function PriceToolTip(props) {
    return (
        <ToolTip header="Order price" id={"price_tooltip"}>
            % of published {ETHEUR} price. <br /> The actual price will be calculated based on the rate published by
            Augmint at the time of the matching executed. The published price is calculated as an avarage rate from
            multiple exchanges.
        </ToolTip>
    );
}
