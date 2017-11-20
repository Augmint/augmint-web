import React from "react";
import { BigNumber } from "bignumber.js";
import ToolTip from "components/ToolTip";

export function TransferFeeToolTip(props) {
    const { feeDiv, feeMin, feeMax, decimalsDiv } = props.tokenAcdInfo;
    const feePt = feeDiv
        ? new BigNumber(1)
              .div(feeDiv)
              .mul(100)
              .toString()
        : "?";
    const feeMinAmount = feeMin ? feeMin.div(decimalsDiv).toString() : "?";
    const feeMaxAmount = feeMax ? feeMax.div(decimalsDiv).toString() : "?";
    return (
        <ToolTip header="ACD transfer fees">
            Fee: {feePt}%<br />
            Min fee: {feeMinAmount} ACD<br />
            Max fee: {feeMaxAmount} ACD <br />
            Transfer fees are used for Augmint system improvements, maintenance
            and contributor rewards.
        </ToolTip>
    );
}
