import React from "react";
import { Link } from "react-router-dom";
import { EthSubmissionSuccessPanel } from "../../../components/MsgPanels";

export default function NewLoanSuccess(props) {
    const { address, disbursedLoanInUcd, eth } = props.result;
    return (
        <EthSubmissionSuccessPanel
            header={<h3>You've got a loan</h3>}
            eth={eth}
        >
            <p>
                Your loan contract address: {address}
            </p>
            <p>
                Disbursed: {disbursedLoanInUcd} UCD
            </p>
            <p>Don't forget to pay it back on maturity.</p>
            <p>
                You can always check your loan's status on the{" "}
                <Link to="/">Home page</Link>
            </p>
        </EthSubmissionSuccessPanel>
    );
}
