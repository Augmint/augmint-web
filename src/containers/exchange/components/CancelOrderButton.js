/* TODO:
 -  make confirmation through flash notification (so we don't need to keep it open while tx processing)
 - confirmation modal closes if there is an order / ordefill / cancel event in the background. We need to  handle
        it's b/c we reload the whole order book on newOrder / orderfill events. It's planned to maintan orderbook
        state on client which will resolve this issue.
*/
import React from "react";
import { connect } from "react-redux";
import Button from "components/augmint-ui/button";
import Icon from "components/augmint-ui/icon";
import Header from "components/augmint-ui/header";
import Modal from "components/augmint-ui/modal";
import { cancelOrder, CANCEL_ORDER_SUCCESS, TOKEN_SELL, TOKEN_BUY } from "modules/reducers/orders";
import { EthSubmissionErrorPanel } from "components/MsgPanels";

import theme from "styles/theme";

class CancelOrderButton extends React.Component {
    async submitCancel(values) {
        //values.preventDefault();
        this.setState({ submitting: true, error: null, result: null });
        const { order } = this.props;
        const res = await this.props.cancelOrder(order);
        if (res.type !== CANCEL_ORDER_SUCCESS) {
            this.setState({
                submitting: false,
                error: res.error
            });
        } else {
            this.setState({
                submitting: false,
                confirmOpen: false,
                error: null,
                result: res.result
            });
            return;
        }
    }

    handleClose() {
        this.setState({
            error: null,
            confirmOpen: false
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            confirmOpen: false,
            submitting: false,
            error: null,
            result: null
        };
        this.submitCancel = this.submitCancel.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    render() {
        const { order, label = "Cancel" } = this.props;
        const { submitting, error, confirmOpen } = this.state;

        return (
            <div style={{ display: "inline-block" }}>
                <a
                    href={`#cancelOrder-${order.id}`}
                    data-testid={`cancelOrderButton-${order.id}`}
                    onClick={event => {
                        event.preventDefault();
                        this.setState({ confirmOpen: true });
                        return false;
                    }}
                >
                    {label}
                </a>
                {this.state.confirmOpen && (
                    <Modal
                        size="small"
                        open={confirmOpen}
                        closeOnDimmerClick={false}
                        onClose={this.handleClose}
                        onCloseRequest={this.handleClose}
                    >
                        <Header
                            icon="question"
                            content="Cancel your order"
                            className="opacLightGrey"
                            style={{
                                borderBottom: "1px solid",
                                borderBottomColor: theme.colors.opacGrey,
                                padding: "20px"
                            }}
                        />

                        <Modal.Content>
                            {error && (
                                <EthSubmissionErrorPanel
                                    onDismiss={() => {
                                        this.setState({ error: null });
                                    }}
                                    error={error}
                                    header="Order cancel failed."
                                >
                                    <p>Error cancelling the order.</p>
                                </EthSubmissionErrorPanel>
                            )}
                            <p>Order id: {order.id}</p>
                            {order.direction === TOKEN_SELL && (
                                <p>
                                    Sell {order.amount} A-EUR @{order.price * 100}% EUR/ETH rate
                                </p>
                            )}
                            {order.direction === TOKEN_BUY && (
                                <p>
                                    Buy A-EUR for {order.amount} ETH @{order.price * 100}% EUR/ETH rate
                                </p>
                            )}
                            <p>Are you sure you want to cancel your order?</p>
                        </Modal.Content>

                        <Modal.Actions>
                            <Button className="grey" onClick={this.handleClose}>
                                <Icon name="close" style={{ marginRight: "6px" }} />Close
                            </Button>

                            <Button
                                data-testid={`confirmCancelOrderButton-${order.id}`}
                                id={`ConfirmCancelOrderButton-${order.id}`}
                                disabled={submitting}
                                onClick={this.submitCancel}
                                content={submitting ? "Submitting..." : "Submit order cancellation"}
                            >
                                <Icon name="trash" style={{ marginRight: "6px" }} />
                            </Button>
                        </Modal.Actions>
                    </Modal>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLoading: state.exchange.isLoading
});

const mapDispatchToProps = { cancelOrder };

export default (CancelOrderButton = connect(mapStateToProps, mapDispatchToProps)(CancelOrderButton));
