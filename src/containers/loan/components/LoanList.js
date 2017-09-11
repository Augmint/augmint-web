import React from "react";
import { MyListGroup } from "components/MyListGroups";
import { Pblock } from "components/PageLayout";
import LoanListDetails from "./LoanListDetails";

export default function LoanList(props) {
    const listItems =
        props.loans == null ? (
            <span>Loading...</span>
        ) : (
            props.loans
                .filter(
                    props.filter
                        ? props.filter
                        : () => {
                              return true; // no filter passed
                          }
                )
                .map((loan, index) => (
                    <MyListGroup.Row key={loan.loanId}>
                        <LoanListDetails loan={loan} />
                        {props.selectComponent && (
                            <props.selectComponent loanId={loan.loanId} />
                        )}
                    </MyListGroup.Row>
                ))
        );

    return (
        <Pblock
            loading={props.loans == null || props.loans.isLoading}
            header={props.header}
        >
            {props.loans != null && listItems.length === 0 ? (
                props.noItemMessage
            ) : (
                <MyListGroup>{listItems}</MyListGroup>
            )}
        </Pblock>
    );
}
