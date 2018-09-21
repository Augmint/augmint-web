import React from "react";
import { MyGridTable, MyGridTableRow as Row, MyGridTableColumn as Col } from "components/MyListGroups";
import ReleaseFundsButton from "./ReleaseFundsButton";

export default function LockDetails(props) {
    const lock = props.lock;
    return (
        <MyGridTable>
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
                <Col>Locked for {lock.durationText}</Col>
                <Col>until {lock.lockedUntilText}</Col>
            </Row>

            <Row>
                <Col>Status: </Col>
                <Col>{lock.lockStateText}</Col>
            </Row>

            <Row>
                <Col>lock id:</Col>
                <Col>
                    <small>{lock.id}</small>
                </Col>
            </Row>

            <Row>{lock.isReleasebale && <ReleaseFundsButton lockId={lock.id} />}</Row>
        </MyGridTable>
    );
}
