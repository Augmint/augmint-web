import React from "react";
import { connect } from "react-redux";
import legacyLockersProvider from "modules/legacyLockersProvider";
import { Psegment } from "components/PageLayout";
import { MyListGroup } from "components/MyListGroups";
import { EthSubmissionSuccessPanel, EthSubmissionErrorPanel } from "components/MsgPanels";
import Button from "components/augmint-ui/button";
import { InfoPanel } from "components/MsgPanels";
import Container from "components/augmint-ui/container";
import {
    dismissLegacyLocker,
    releaseLegacyFunds,
    LEGACY_LOCKERS_RELEASE_SUCCESS
} from "modules/reducers/legacyLockers";
import HashURL from "components/hash";

const styleP = { margin: "1rem 0" };

class LegacyLockers extends React.Component {
    constructor(props) {
        super(props);
        this.handleDismiss = this.handleDismiss.bind(this);
        this.submitReleaseFunds = this.submitReleaseFunds.bind(this);
        this.state = {
            submitting: false,
            submitSucceeded: false,
            error: null,
            result: null
        };
    }

    componentDidMount() {
        legacyLockersProvider();
    }

    handleDismiss(legacyLockerAddress) {
        this.props.dismissLegacyLocker(legacyLockerAddress);
    }

    async submitReleaseFunds(legacyLockerAddress, lockId) {
        this.setState({ submitting: true, error: null, result: null });
        const res = await this.props.releaseLegacyFunds(legacyLockerAddress, lockId);
        if (res.type !== LEGACY_LOCKERS_RELEASE_SUCCESS) {
            this.setState({
                submitting: false,
                error: res.error
            });
        } else {
            this.setState({
                submitting: false,
                submitSucceeded: true,
                error: null,
                result: res.result
            });
            return;
        }
    }

    render() {
        const { contracts, lockerContract, network } = this.props;
        const { error, submitting, submitSucceeded, result } = this.state;

        const locks = contracts
            .filter(contract => contract.locks.length > 0 && !contract.isDismissed)
            .map((contract, contractIndex) => (
                <MyListGroup.Col key={`contractColDiv-${contractIndex}`} size={1}>
                    <p style={styleP}>
                        {contract.locks.length} locks in legacy Lock contract{" "}
                        <small>
                            <HashURL hash={lockerContract.address} type={"address/"} />
                        </small>
                    </p>

                    <p style={styleP}>
                        <Button
                            type="submit"
                            data-testid={`dismissLegacyLockerButton-${contractIndex}`}
                            onClick={() => this.handleDismiss(contract.address)}
                        >
                            Dismiss
                        </Button>
                    </p>

                    {contract.locks.map((lock, lockIndex) => (
                        <MyListGroup.Col key={`ordersDiv-${contractIndex}-${lock.id}`}>
                            <p style={styleP}>
                                Lock id: {lock.id} <br />Amount locked: {lock.amountLocked} A€ (+ {lock.interestEarned}{" "}
                                A€ premium)
                            </p>

                            {lock.isSubmitted ? (
                                <p style={styleP}>
                                    Release funds submitted, wait for transaction confirmations then refresh page
                                </p>
                            ) : lock.isReleasebale ? (
                                <Button
                                    type="submit"
                                    primary
                                    disabled={submitting}
                                    data-testid={`releaseLegacyLockButton-${contractIndex}-${lock.id}`}
                                    onClick={() => this.submitReleaseFunds(contract.address, lock.id)}
                                >
                                    {submitting ? "Submitting legacy funds release..." : "Release funds"}
                                </Button>
                            ) : (
                                <p style={styleP}>This lock will be releaseable on {lock.lockedUntilText}</p>
                            )}
                        </MyListGroup.Col>
                    ))}
                </MyListGroup.Col>
            ));

        return locks && locks.length > 0 && lockerContract ? (
            <Psegment>
                <Container>
                    <InfoPanel header="You have locked funds in an older version of Augmint Locker contract">
                        <p style={styleP}>
                            Augmint Locker version in use on{" "}
                            <HashURL
                                hash={lockerContract.address}
                                title={network.name + " network"}
                                type={"address/"}
                            />.
                            <br />
                            You can release your funds in the old locker contract when the lock expired.<br />
                            <small>
                                NB: Locker contract upgrades will be infrequent when Augmint released in public. During
                                pilots we deliberately deploy a couple of new versions to test the conversion process.
                            </small>
                        </p>
                        {error && (
                            <EthSubmissionErrorPanel
                                error={error}
                                header="Legacy lock release  failed"
                                onDismiss={() => this.setState({ error: null })}
                            />
                        )}
                        {submitSucceeded && (
                            <EthSubmissionSuccessPanel
                                header="Legacy lock release funds submitted"
                                result={result}
                                onDismiss={() => this.setState({ submitSucceeded: false, result: null })}
                            />
                        )}
                        {!submitSucceeded && !error && locks}
                    </InfoPanel>
                </Container>
            </Psegment>
        ) : null;
    }
}

function mapStateToProps(state) {
    return {
        contracts: state.legacyLockers.contracts,
        lockerContract: state.contracts.latest.lockManager,
        network: state.web3Connect.network
    };
}

const mapDispatchToProps = { dismissLegacyLocker, releaseLegacyFunds };

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LegacyLockers);
