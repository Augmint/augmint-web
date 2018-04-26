import React from "react";
import { Message } from "semantic-ui-react";

export function RepayHelp(props) {
    const { ...other } = props;
    return (
        <Message info {...other}>
            <p>You can repay your A-EUR loan anytime before its maturity. </p>
            <p>All of your ETH held in escrow (collateral) will be sent back to you when you repay.</p>
            <p>If you don't repay until maturity then you can't repay anymore and your loan will be defaulted.</p>

            <p>
                <strong>Default (non payment)</strong>
                <br />
                If you decide not to repay the A-EUR loan at maturity then your ETH will be taken to the Augmint system
                reserves.
            </p>
            <p>
                If the value of your ETH (at the moment of collection) is higher than the A-EUR value of your loan +
                fees for the default then the leftover ETH will be transfered back to your ETH account.
            </p>
        </Message>
    );
}
