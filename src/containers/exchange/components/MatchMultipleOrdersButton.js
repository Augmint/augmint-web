import React from "react";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";
import Button from "components/augmint-ui/button";
import { matchMultipleOrders, MATCH_MULTIPLE_ORDERS_SUCCESS } from "modules/reducers/orders";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";

class MatchMultipleOrdersButton extends React.Component {
    async handleClick(values) {
        this.setState({ submitting: true, submitSucceeded: false, error: null, result: null });

        const res = await this.props.matchMultipleOrders();

        if (res.type !== MATCH_MULTIPLE_ORDERS_SUCCESS) {
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

    onDismiss() {
        this.setState({ error: null, submitSucceeded: false });
    }

    constructor(props) {
        super(props);
        this.state = { submitSucceeded: false, submitting: false, error: null, result: null };
        this.handleClick = this.handleClick.bind(this);
        this.onDismiss = this.onDismiss.bind(this);
    }

    render() {
        const { buyOrder, sellOrder, isLoaded, size = "medium", label = "Match" } = this.props;
        const { submitSucceeded, submitting, error, result } = this.state;

        const isMatching = sellOrder && buyOrder && sellOrder.price <= buyOrder.price;
        return (
            <Pblock>
                {error && (
                    <EthSubmissionErrorPanel error={error} header="Order match failed." onDismiss={this.onDismiss}>
                        <p>Error matching the orders.</p>
                    </EthSubmissionErrorPanel>
                )}

                {!isMatching && isLoaded && <p>No matching orders</p>}

                {!submitSucceeded && isMatching && isLoaded && (
                    <Button
                        size={size}
                        data-testid="matchMultipleOrdersButton"
                        disabled={submitting === 0}
                        onClick={this.handleClick}
                    >
                        {submitting ? "Submitting..." : label}
                    </Button>
                )}

                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header="Order match submitted"
                        onDismiss={this.onDismiss}
                        result={result}
                    />
                )}
            </Pblock>
        );
    }
}

const mapStateToProps = state => ({
    isLoaded: state.exchange.isLoaded
});

const mapDispatchToProps = { matchMultipleOrders };

export default (MatchMultipleOrdersButton = connect(
    mapStateToProps,
    mapDispatchToProps
)(MatchMultipleOrdersButton));
