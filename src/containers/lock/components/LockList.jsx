import React from "react";
import { MyListGroup } from "components/MyListGroups";
import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import Button from "components/augmint-ui/button";
import LockListDetails from "./LockListDetails";

export default function LockList(props) {
    const { isLoading, error, locks } = props.locks;
    const listItems =
        locks &&
        locks
            .filter(props.filter ? props.filter : lock => lock.isReleasebale || lock.isActive)
            .map((lock, index) => (
                <MyListGroup.Row key={`lock-${lock.id}`}>
                    <LockListDetails lock={lock} />
                </MyListGroup.Row>
            ))
            .reverse();

    return (
        <Pblock data-testid="LockListBlock" loading={isLoading} header={props.header}>
            {error && <ErrorPanel header="Error while fetching lock list">{error.message}</ErrorPanel>}
            {locks && listItems.length === 0 ? (
                <div>
                    <p>You have no active locks.</p>
                </div>
            ) : (
                <MyListGroup>{listItems}</MyListGroup>
            )}
            <div className="dashblock__footer">
                {locks &&
                    listItems.length > 0 && (
                        <Button className="naked" to="/lock">
                            View all
                        </Button>
                    )}
                <Button style={{ marginLeft: "auto" }} to="/lock/new">
                    Lock A-EUR
                </Button>
            </div>
        </Pblock>
    );
}
