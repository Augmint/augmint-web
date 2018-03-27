import React from "react";
import { EthSubmissionSuccessPanel } from "components/MsgPanels";

export default function NewLoanSuccess(props) {
    const { collateralEth } = props.result;
    return (
        <EthSubmissionSuccessPanel header="New loan submitted" result={props.result} dismissable={false}>
            Collateral sent: {collateralEth} ETH
        </EthSubmissionSuccessPanel>
    );
}
