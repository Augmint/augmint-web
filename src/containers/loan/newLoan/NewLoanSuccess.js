import React from "react";
import { Link } from "react-router-dom";
import { EthSubmissionSuccessPanel } from "components/MsgPanels";

export default function NewLoanSuccess(props) {
    const {
        address,
        disbursedLoanInUcd,
        loanId,
        borrower,
        productId,
        eth
    } = props.result;
    return (
        <EthSubmissionSuccessPanel
            header={<h3>You've got a loan</h3>}
            eth={eth}
            dismissable={false}
        >
            <p>
                Loan id: {loanId}
            </p>
            <p>
                Contract address: {address}
            </p>
            <p>
                Disbursed: {disbursedLoanInUcd} UCD
            </p>
            <p>Don't forget to pay it back on maturity.</p>
            <p>
                You can always check your loans'' status on {" "}
                <Link to="/account">My account page</Link>
                <br />
                or directly on {" "}
                <Link to={"/loan/" + loanId}>this loan's page</Link>
            </p>
            <p>
                Product id: {productId} | borrower: {borrower}
            </p>
        </EthSubmissionSuccessPanel>
    );
}
