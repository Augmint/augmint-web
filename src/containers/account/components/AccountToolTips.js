import React from "react";
import ToolTip from "components/ToolTip";

export function TransferFeeToolTip(props) {
    const { feePt, feeMin, feeMax, decimalsDiv } = props.tokenAcdInfo;
    const _feePt = feePt ? feePt.div(10000).toString() : "?";
    const feeMinAmount = feeMin ? feeMin.div(decimalsDiv).toString() : "?";
    const feeMaxAmount = feeMax ? feeMax.div(decimalsDiv).toString() : "?";
    return (
        <ToolTip header="ACE transfer fees">
            Fee: {_feePt}%<br />
            Min fee: {feeMinAmount} ACE<br />
            Max fee: {feeMaxAmount} ACE <br />
            Transfer fees are used for Augmint system improvements, maintenance and contributor rewards.
        </ToolTip>
    );
}
