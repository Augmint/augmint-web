import React from "react";
import { connect } from "react-redux";
import legacyExchangesProvider from "modules/legacyExchangesProvider";
import { Psegment } from "components/PageLayout";
import { MyListGroup } from "components/MyListGroups";
import { EthSubmissionSuccessPanel, EthSubmissionErrorPanel } from "components/MsgPanels";
import Button from "components/augmint-ui/button";
import { InfoPanel } from "components/MsgPanels";
import Container from "components/augmint-ui/container";
import {
    dismissLegacyExchange,
    cancelLegacyExchangeOrder,
    LEGACY_EXCHANGES_CANCEL_ORDER_SUCCESS
} from "modules/reducers/legacyExchanges";
import HashURL from "components/hash";

const styleP = { margin: "1rem 0" };

class LegacyExchanges extends React.Component {
    constructor(props) {
        super(props);
        this.handleDismiss = this.handleDismiss.bind(this);
        this.submitOrderCancel = this.submitOrderCancel.bind(this);
        this.state = {
            submitting: false,
            submitSucceeded: false,
            error: null,
            result: null
        };
    }

    componentDidMount() {
        legacyExchangesProvider();
    }

    handleDismiss(legacyExchangeAddress) {
        this.props.dismissLegacyExchange(legacyExchangeAddress);
    }

    async submitOrderCancel(legacyExchangeAddress, direction, orderId) {
        this.setState({ submitting: true, error: null, result: null });
        const res = await this.props.cancelLegacyExchangeOrder(legacyExchangeAddress, direction, orderId);
        if (res.type !== LEGACY_EXCHANGES_CANCEL_ORDER_SUCCESS) {
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
        const { contracts, exchangeContract, network } = this.props;
        const { error, submitting, submitSucceeded, result } = this.state;

        const orders = contracts
            .filter(contract => contract.userOrders.length > 0 && !contract.isDismissed)
            .map((contract, contractIndex) => (
                <MyListGroup.Col key={`contractColDiv-${contractIndex}`} size={1}>
                    <p style={styleP}>
                        {contract.userOrders.length} orders in legacy Exchange contract{" "}
                        <small>
                            <HashURL hash={contract.address} type={"address/"} />{" "}
                        </small>
                    </p>

                    <p style={styleP}>
                        <Button
                            type="submit"
                            data-testid={`dismissLegacyExchangeButton-${contractIndex}`}
                            onClick={() => this.handleDismiss(contract.address)}
                        >
                            Dismiss
                        </Button>
                    </p>

                    {contract.userOrders.map((order, orderIndex) => (
                        <MyListGroup.Col key={`ordersDiv-${contractIndex}-${order.id}`}>
                            <p style={styleP}>
                                Order id: {order.id} <br />Amount: {order.amount} {order.direction === 0 ? "ETH" : "A€"}
                            </p>

                            {order.isSubmitted ? (
                                <p style={styleP}>
                                    Cancel submitted, wait for transaction confirmations then refresh page
                                </p>
                            ) : (
                                <Button
                                    type="submit"
                                    primary
                                    disabled={submitting}
                                    data-testid={`convertLegacyExchangeButton-${contractIndex}-${order.id}`}
                                    onClick={() => this.submitOrderCancel(contract.address, order.direction, order.id)}
                                >
                                    {submitting ? "Submitting order cancel..." : "Cancel order"}
                                </Button>
                            )}
                        </MyListGroup.Col>
                    ))}
                </MyListGroup.Col>
            ));

        return orders && orders.length > 0 && exchangeContract ? (
            <Psegment>
                <Container>
                    <InfoPanel header="You have orders in an older version of Augmint Exchange contract">
                        <p style={styleP}>
                            Augmint Exchange version in use on{" "}
                            <HashURL
                                hash={exchangeContract.address}
                                title={network.name + " network"}
                                type={"address/"}
                            />.
                            <br />
                            You can cancel your orders on the old exchange.<br />
                            <small>
                                NB: Exchange contract upgrades will be infrequent when Augmint released in public.
                                During pilots we deliberately deploy a couple of new versions to test the conversion
                                process.
                            </small>
                        </p>
                        {error && (
                            <EthSubmissionErrorPanel
                                error={error}
                                header="Legacy order cancel failed"
                                onDismiss={() => this.setState({ error: null })}
                            />
                        )}
                        {submitSucceeded && (
                            <EthSubmissionSuccessPanel
                                header="Legacy order cancel submitted"
                                result={result}
                                onDismiss={() => this.setState({ submitSucceeded: false, result: null })}
                            />
                        )}
                        {!submitSucceeded && !error && orders}
                    </InfoPanel>
                </Container>
            </Psegment>
        ) : null;
    }
}

function mapStateToProps(state) {
    return {
        contracts: state.legacyExchanges.contracts,
        exchangeContract: state.contracts.latest.exchange,
        network: state.web3Connect.network
    };
}

const mapDispatchToProps = { dismissLegacyExchange, cancelLegacyExchangeOrder };

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LegacyExchanges);
