/*
    TODO: clean up this
*/
import React from "react";
import { connect } from "react-redux";
import LockDetails from "./components/LockDetails";
import { Pheader, Pblock, Psegment, Pgrid } from "components/PageLayout";
import { LoadingPanel, ErrorPanel } from "components/MsgPanels";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";

class LockDetailsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lock: null,
            lockId: this.props.match.params.lockId,
            isLoading: true
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.locks !== this.props.locks) {
            this.setLock(); // needed when landing from on URL directly
        }
    }

    componentDidMount() {
        this.setLock(); // needed when landing from Link within App
    }

    setLock() {
        // workaround b/c landing directly on URL and from LoanSelector triggers different events.
        if (this.props.locks == null) {
            return;
        } // not loaded yet
        let isLockFound;
        const lock = this.props.locks.find(item => {
            return item.id === Number(this.state.lockId);
        });
        if (typeof lock === "undefined") {
            isLockFound = false;
        } else {
            isLockFound = true;
        }
        this.setState({
            isLoading: false,
            lock: lock,
            isLockFound: isLockFound
        });
    }

    render() {
        return (
            <Psegment>
                <TopNavTitlePortal>
                    <Pheader header="Lock details" />
                </TopNavTitlePortal>
                {this.state.isLoading && (
                    <LoadingPanel>
                        Fetching data (lock id: {this.state.lockId}
                        )...
                    </LoadingPanel>
                )}
                {!this.state.isLoading &&
                    !this.state.isLockFound && (
                        <ErrorPanel>
                            Can't find lock #{this.state.lockId} for current account {this.props.userAccount}
                        </ErrorPanel>
                    )}

                {this.state.isLockFound && (
                    <Pgrid>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2, desktop: 8 / 16 }}>
                                <Pblock
                                    header={this.state.lock.lockStateText + " lock #" + this.state.lock.id}
                                    className={"tertiaryColor"}
                                >
                                    <LockDetails lock={this.state.lock} />
                                </Pblock>
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                )}
            </Psegment>
        );
    }
}

const mapStateToProps = state => ({
    locks: state.locks.locks,
    lockManager: state.lockManager,
    userAccount: state.web3Connect.userAccount
});

export default (LockDetailsPage = connect(mapStateToProps)(LockDetailsPage));
