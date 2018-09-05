import React from "react";
import { MyListGroup } from "components/MyListGroups";
import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import Button from "components/augmint-ui/button";
import LoanListDetails from "./LoanListDetails";

export default function LoanList(props) {
    const { isLoading, error, loans } = props.loans;
    const listItems =
        loans &&
        loans.filter(props.filter ? props.filter : loan => loan.isRepayable).map(loan => (
            <MyListGroup.Row key={`loan-${loan.id}`}>
                <LoanListDetails loan={loan} />
                {props.selectComponent && <props.selectComponent loanId={loan.id} />}
            </MyListGroup.Row>
        ));

    return (
        <Pblock data-testid="LoanListBlock" loading={isLoading} header={props.header}>
            {error && <ErrorPanel header="Error while fetching loan list">{error.message}</ErrorPanel>}
            {loans && listItems.length === 0 ? (
                <div>
                    <p>
                        <strong>You have no active loans.</strong> Look at our offers.
                    </p>
                </div>
            ) : (
                <MyListGroup>{listItems}</MyListGroup>
            )}
            <div className="dashblock__footer">
                <Button className="naked" to="/loan">
                    View all
                </Button>
                <Button style={{ marginLeft: "auto" }} to="/loan/new">
                    Get a new loan
                </Button>
            </div>
        </Pblock>
    );
}
