import React from "react";
import { MyListGroup } from "components/MyListGroups";
import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
// import ReleaseFundsButton from "./ReleaseFundsButton";
import Button from "components/augmint-ui/button";
import LockListDetails from "./LockListDetails";

// function LockDetails(props) {
//     const { lock } = props;
//     return (
//         <MyGridTable header={`${lock.lockStateText} lock # ${lock.id}`}>
//             <Row>
//                 <Col>Locked amount:</Col>
//                 <Col>{lock.amountLocked} A-EUR</Col>
//             </Row>

//             <Row>
//                 <Col>Interest amount:</Col>
//                 <Col>
//                     {lock.interestEarned} A-EUR ({(lock.interestRatePa * 100).toFixed(2)} % p.a)
//                 </Col>
//             </Row>

//             <Row>
//                 <Col>locked for {lock.durationText}</Col>
//                 <Col>until {lock.lockedUntilText}</Col>
//             </Row>

//             <Row>{lock.isReleasebale && <ReleaseFundsButton lockId={lock.id} />}</Row>
//         </MyGridTable>
//     );
// }

export default function LockList(props) {
    console.log(props.locks);
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
            {/* {locks && listItems.length === 0 ? "You have no locks" : <MyListGroup>{listItems}</MyListGroup>} */}
            {locks && listItems.length === 0 ? (
                <div>
                    <p>You have no ?active? locks.</p>
                </div>
            ) : (
                <MyListGroup>{listItems}</MyListGroup>
            )}
            <div className="dashblock__footer">
                {locks &&
                    listItems.length > 0 && (
                        <Button className="naked" to="/loan">
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
