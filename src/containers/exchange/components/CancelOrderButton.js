import React from "react";
import { connect } from "react-redux";
//import { Pblock } from "components/PageLayout";
import { Button, Modal, Header, Icon } from "semantic-ui-react";
import { cancelOrder, CANCEL_ORDER_SUCCESS } from "modules/reducers/orders";
import { EthSubmissionErrorPanel } from "components/MsgPanels";
import { flashSuccessMessage } from "redux-flash";

class CancelOrderButton extends React.Component {
    async submitCancel(values) {
        //values.preventDefault();
        this.setState({ confirmOpen: false, error: null, result: null });
        const { order } = this.props;
        const res = await this.props.cancelOrder(order);
        if (res.type !== CANCEL_ORDER_SUCCESS) {
            this.setState({
                submitting: false,
                error: {
                    title: "Ethereum transaction failed",
                    details: res.error,
                    eth: res.eth
                }
            });
        } else {
            this.setState({
                submitting: false,
                error: null,
                result: res.result
            });
            this.props.flashSuccessMessage("Order cancelled", {
                timeout: false,
                props: { result: res.result, order: order }
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
        const CancelButton = (
            <a
                href={`#cancelOrder-${order.id}`}
                onClick={event => {
                    event.preventDefault();
                    this.setState({ confirmOpen: true });
                    return false;
                }}
            >
                {label}
            </a>
        );
        return !order ? null : (
            <Modal size="small" open={confirmOpen} onClose={this.handleClose} trigger={CancelButton}>
                <Header icon="question" content="Cancel your order" />
                <Modal.Content>
                    {error && (
                        <EthSubmissionErrorPanel dismissable error={error} header="Order cancel failed.">
                            <p>Error cancelling the order.</p>
                        </EthSubmissionErrorPanel>
                    )}
                    <p>Order id: {order.id}</p>
                    <p>Amount: {order.amount}</p>
                    <p>Are you sure you want to cancel your order?</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.handleClose}>
                        <Icon name="cancel" />Cancel
                    </Button>

                    <Button
                        primary
                        className="ConfirmCancelOrderButton"
                        id={`ConfirmCancelOrderButton-${order.id}`}
                        disabled={submitting}
                        onClick={this.submitCancel}
                        icon="trash"
                        content={submitting ? "Submitting..." : "Confirm Cancel"}
                    />
                </Modal.Actions>
            </Modal>
        );
    }
}

const mapStateToProps = state => ({
    isLoading: state.exchange.isLoading
});

const mapDispatchToProps = { cancelOrder, flashSuccessMessage };

export default (CancelOrderButton = connect(mapStateToProps, mapDispatchToProps)(CancelOrderButton));
