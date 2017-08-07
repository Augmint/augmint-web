import React from "react";
import { Panel } from "react-bootstrap";
import { mListGroup, mListGroupItem } from "components/mListGroups";
import LoanListDetails from "./LoanListDetails";

export default function LoanList(props) {
    const listItems =
        props.loans == null
            ? <p>Loading...</p>
            : props.loans
                  .filter(
                      props.filter
                          ? props.filter
                          : () => {
                                return true; // no filter passed
                            }
                  )
                  .map((loan, index) =>
                      <mListGroupItem key={`loanDiv-${loan.loanId}`}>
                          <LoanListDetails
                              loan={loan}
                              selectComponent={props.selectComponent}
                          />
                      </mListGroupItem>
                  );

    return (
        <Panel header={props.header}>
            {props.loans != null && listItems.length === 0
                ? props.noItemMessage
                : <mListGroup>
                      {listItems}
                  </mListGroup>}
        </Panel>
    );
}
