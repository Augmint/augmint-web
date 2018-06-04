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
        return (
            <Pgrid.Row wrap={false}>
                <Pgrid.Column size={10 / 32}>
                    <LockManagerInfo contractData={this.props.lockManagerData} contract={this.props.lockManager} />
                </Pgrid.Column>
                <Pgrid.Column size={1 / 32} />
                <Pgrid.Column size={10 / 32}>
                    <ArrayDump header="Lock Products" items={this.props.lockProducts} />
                </Pgrid.Column>
                <Pgrid.Column size={1 / 32} />
                <Pgrid.Column size={10 / 32}>
                    <ArrayDump header="Locks for userAccount" items={this.props.locks} />
                </Pgrid.Column>
            </Pgrid.Row>
        );
    }
}

const mapStateToProps = state => ({
    lockManager: state.contracts.latest.lockManager,
    lockManagerData: state.lockManager,
    lockProducts: state.lockManager.products,
    locks: state.locks.locks
});

export default connect(mapStateToProps)(LocksInfoGroup);
