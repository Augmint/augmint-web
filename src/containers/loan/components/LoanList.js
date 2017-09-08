import React from "react";
import { MyListGroup, MyListGroupItem } from "components/MyListGroups";
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
                    <MyListGroupItem key={`loanDiv-${loan.loanId}`}>
                        <LoanListDetails
                            loan={loan}
                            selectComponent={props.selectComponent}
                        />
                    </MyListGroupItem>
                ))
        );

    return (
        <Pblock header={props.header}>
            {props.loans != null && listItems.length === 0 ? (
                props.noItemMessage
            ) : (
                <MyListGroup>{listItems}</MyListGroup>
            )}
        </Pblock>
    );
}
