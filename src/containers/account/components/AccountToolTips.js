import React from "react";
import ToolTip from "components/ToolTip";

export function TransferFeeToolTip(props) {
    const { feePt, feeMin, feeMax, decimalsDiv } = props.tokenAcdInfo;
    const _feePt = feePt ? feePt.div(10000).toString() : "?";
    const feeMinAmount = feeMin ? feeMin.div(decimalsDiv).toString() : "?";
    const feeMaxAmount = feeMax ? feeMax.div(decimalsDiv).toString() : "?";
    return (
        <ToolTip header="ACD transfer fees">
            Fee: {_feePt}%<br />
            Min fee: {feeMinAmount} ACD<br />
            Max fee: {feeMaxAmount} ACD <br />
            Transfer fees are used for Augmint system improvements, maintenance
            and contributor rewards.
        </ToolTip>
    );
}
