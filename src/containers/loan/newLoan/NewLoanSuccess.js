import React from "react";
import { EthSubmissionSuccessPanel } from "components/MsgPanels";
import { ETH } from "components/augmint-ui/currencies";

export default function NewLoanSuccess(props) {
    return (
        <EthSubmissionSuccessPanel header="New loan submitted" result={props.result} dismissable={false}>
            Collateral sent: <ETH amount={props.ethAmount} />
        </EthSubmissionSuccessPanel>
    );
}
