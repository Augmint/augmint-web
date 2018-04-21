import React from "react";
import { MyListGroup } from "components/MyListGroups";
import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import LoanListDetails from "./LoanListDetails";

export default function LoanList(props) {
    const { isLoading, error, loans } = props.loans;
    const listItems =
        loans &&
        loans
            .filter(
                props.filter
                    ? props.filter
                    : () => {
                          return true; // no filter passed
                      }
            )
            .map((loan, index) => (
                <MyListGroup.Row key={`loan-${loan.id}`}>
                    <LoanListDetails loan={loan} />
                    {props.selectComponent && <props.selectComponent loanId={loan.id} />}
                </MyListGroup.Row>
            ));

    return (
        <Pblock data-testid="LoanListBlock" loading={isLoading} header={props.header}>
            {error && <ErrorPanel header="Error while fetching loan list">{error.message}</ErrorPanel>}
            {loans && listItems.length === 0 ? props.noItemMessage : <MyListGroup>{listItems}</MyListGroup>}
        </Pblock>
    );
}
