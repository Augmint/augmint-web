import React from "react";
import { MyListGroup, MyGridTable, MyGridTableRow as Row, MyGridTableColumn as Col } from "components/MyListGroups";
import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import ReleaseFundsButton from "./ReleaseFundsButton";

function LockDetails(props) {
    const { lock } = props;
    return (
        <MyGridTable header={`${lock.lockStateText} lock # ${lock.id}`}>
            <Row>
                <Col>Locked amount:</Col>
                <Col>{lock.amountLocked} A-EUR</Col>
            </Row>

            <Row>
                <Col>Interest amount:</Col>
                <Col>
                    {lock.interestEarned} A-EUR ({(lock.interestRatePa * 100).toFixed(2)} % p.a)
                </Col>
            </Row>

            <Row>
                <Col>locked for {lock.durationText}</Col>
                <Col>until {lock.lockedUntilText}</Col>
            </Row>

            <Row>{lock.isReleasebale && <ReleaseFundsButton lockId={lock.id} />}</Row>
        </MyGridTable>
    );
}

export default function LockList(props) {
    const { isLoading, error, locks } = props.locks;
    const listItems =
        locks &&
        locks
            .filter(
                props.filter
                    ? props.filter
                    : () => {
                          return true; // no filter passed
                      }
            )
            .map((lock, index) => (
                <MyListGroup.Row key={`lock-${lock.id}`}>
                    <LockDetails lock={lock} />
                </MyListGroup.Row>
            ));

    return (
        <Pblock data-testid="LockListBlock" loading={isLoading} header="My Locks">
            {error && <ErrorPanel header="Error while fetching lock list">{error.message}</ErrorPanel>}
            {locks && listItems.length === 0 ? "You have no locks" : <MyListGroup>{listItems}</MyListGroup>}
        </Pblock>
    );
}
