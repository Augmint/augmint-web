import React from "react";
import { connect } from "react-redux";
import { Pgrid } from "components/PageLayout";
import { LockManagerInfo } from "./components/LockManagerInfo";
import { ArrayDump } from "./components/ArrayDump";
import lockManagerProvider from "modules/lockManagerProvider";

class LocksInfoGroup extends React.Component {
    componentDidMount() {
        lockManagerProvider();
    }

    render() {
        const { lockManager, lockProducts, locks } = this.props;
        return (
            <Pgrid columns={3}>
                <Pgrid.Column>
                    <LockManagerInfo contract={lockManager} />
                </Pgrid.Column>
                <Pgrid.Column>
                    <ArrayDump header="Lock Products" items={lockProducts} />
                </Pgrid.Column>
                <Pgrid.Column>
                    <ArrayDump header="Locks for userAccount" items={locks} />
                </Pgrid.Column>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    lockManager: state.lockManager,
    lockProducts: state.lockManager.products,
    locks: state.locks.locks
});

export default connect(mapStateToProps)(LocksInfoGroup);
