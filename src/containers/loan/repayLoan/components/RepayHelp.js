import React from "react";
import { Message } from "semantic-ui-react";

export function RepayHelp(props) {
    const { ...other } = props;
    return (
        <Message info {...other}>
            <p>You can repay your ACD loan due on its maturity. </p>
            <p>
                When you repay your ETH held in escrow (collateral) will be sent
                back to you.
            </p>
            <p>
                You must pay latest by when the loan's repayment period is over.
            </p>
            <p>
                <strong>Default (non payment)</strong>
                <br />
                If you decide not repay by the repayment period is over then
                your ETH collateral will be taken to system reserves.
            </p>
            <p>
                TODO, Not yet implemented: If the value of the ETH collateral
                (at the moment of collection) is higher than the ACD loan amount
                less the fees for the collection then the leftover ETH will be
                transfered back to the borrower's ETH account.
            </p>
        </Message>
    );
}
