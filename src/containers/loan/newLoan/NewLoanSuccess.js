import React from "react";
import { Link } from "react-router-dom";
import { EthSubmissionSuccessPanel } from "components/MsgPanels";

export default function NewLoanSuccess(props) {
    const { loanAmount, repaymentAmount, collateralEth, loanId, borrower, productId, eth } = props.result;
    return (
        <EthSubmissionSuccessPanel header={<h3>You've got a loan</h3>} eth={eth} dismissable={false}>
            <p>Loan id: {loanId}</p>
            <p>Disbursed: {loanAmount} <nobr>A-EUR</nobr></p>
            <p>To be repayed: {repaymentAmount} <nobr>A-EUR</nobr></p>
            <p>Collateral in escrow: {collateralEth} ETH</p>
            <p>Don't forget to pay it back on maturity to get back your collateral.</p>
            <p>
                You can always check your loans'' status on <Link to="/account">My account page</Link>
                <br />
                or directly on <Link to={"/loan/" + loanId}>this loan's page</Link>
            </p>
            <p>
                Product id: {productId} | borrower: {borrower}
            </p>
        </EthSubmissionSuccessPanel>
    );
}
