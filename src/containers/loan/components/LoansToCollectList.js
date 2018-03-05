import React from "react";
import { MyListGroup } from "components/MyListGroups";
import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import LoanListDetails from "./LoanListDetails";

export default function LoansToCollectList(props) {
    const { isLoading, error, loansToCollect } = props.loanManager;
    const listItems =
        loansToCollect &&
        loansToCollect.map((loan, index) => (
            <MyListGroup.Row key={`loanToCollect-${loan.id}`}>
                <LoanListDetails loan={loan} />
                {props.selectComponent && <props.selectComponent loanId={loan.id} />}
            </MyListGroup.Row>
        ));

    return (
        <Pblock testid="loansToCollectBlock" loading={isLoading} header={props.header}>
            {error && <ErrorPanel header="Error while fetching loan list">{error.message}</ErrorPanel>}
            {loansToCollect && listItems.length === 0 ? props.noItemMessage : <MyListGroup>{listItems}</MyListGroup>}
        </Pblock>
    );
}
