import React from "react";
import ToolTip from "components/ToolTip";

export function TransferFeeToolTip(props) {
    const { feePt, feeMin, feeMax } = props.augmintTokenInfo;

    return (
        <ToolTip header="A-EUR transfer fees">
            Fee: {feePt}%<br />
            Min fee: {feeMin} A-EUR
            <br />
            Max fee: {feeMax} A-EUR <br />
            Transfer fees are used for Augmint system improvements, maintenance and contributor rewards.
        </ToolTip>
    );
}
