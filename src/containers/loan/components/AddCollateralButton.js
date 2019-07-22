/* TODO:
 -  make confirmation through flash notification (so we don't need to keep it open while tx processing)
 - confirmation modal closes if there is an order / ordefill / cancel event in the background. We need to  handle
        it's b/c we reload the whole order book on newOrder / orderfill events. It's planned to maintan orderbook
        state on client which will resolve this issue.
*/
import React from "react";
import { connect } from "react-redux";

import store from "modules/store";
import { sendAndProcessTx } from "modules/ethereum/ethHelper";

import Button from "components/augmint-ui/button";
import Icon from "components/augmint-ui/icon";
import Header from "components/augmint-ui/header";
import Modal from "components/augmint-ui/modal";
import { EthSubmissionErrorPanel } from "components/MsgPanels";
import { StyledInput, StyledLabel } from "components/augmint-ui/baseComponents/styles";

import { Wei } from "@augmint/js";

import theme from "styles/theme";

class AddCollateralButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmOpen: false,
            submitting: false,
            error: null,
            result: null,
            ethAmount: null
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
    }

    onInputChange(e) {
        this.setState({
            ethAmount: e.target.value
        });
    }

    async handleSubmit() {
        const { loan, userAccount } = this.props;

        this.setState({
            submitting: true
        });

        try {
            const tx = await store
                .getState()
                .web3Connect.augmint.addExtraCollateral(loan, Wei.of(this.state.ethAmount), userAccount);
            const transactionHash = await sendAndProcessTx(tx, "AddExtraCollateral");

            this.handleClose();

            return transactionHash;
        } catch {
            this.setState({ submitting: false });
        }
    }

    handleClose() {
        this.setState({
            error: null,
            confirmOpen: false
        });
    }

    render() {
        const { submitting, error, confirmOpen } = this.state;

        return (
            <div style={{ display: "block" }}>
                <Button
                    data-testid={`addCollateralButton`}
                    onClick={() => {
                        this.setState({ confirmOpen: true });
                        return false;
                    }}
                >
                    Add extra collateral
                </Button>
                {this.state.confirmOpen && (
                    <Modal
                        size="small"
                        open={confirmOpen}
                        closeOnDimmerClick={false}
                        onClose={this.handleClose}
                        onCloseRequest={this.handleClose}
                    >
                        <Header
                            content="Add extra collateral to your loan"
                            className="opacLightGrey"
                            style={{
                                borderBottom: "1px solid",
                                borderBottomColor: theme.colors.opacGrey,
                                padding: "20px",
                                margin: 0
                            }}
                        ></Header>

                        <Modal.Content>
                            {error && (
                                <EthSubmissionErrorPanel
                                    onDismiss={() => {
                                        this.setState({ error: null });
                                    }}
                                    error={error}
                                    header="Transaction failed."
                                >
                                    <p>Error fulfilling the transaction.</p>
                                </EthSubmissionErrorPanel>
                            )}
                            <form onSubmit={this.handleSubmit}>
                                <StyledLabel style={{ marginRight: "10px" }}>Amount of ETH to add</StyledLabel>
                                <StyledInput
                                    type="number"
                                    inputmode="numeric"
                                    name="addCollateralAmount"
                                    disabled={submitting}
                                    style={{ borderRight: `1px solid ${theme.colors.opacGrey}` }}
                                    data-testid="addCollateralAmountInput"
                                    onChange={this.onInputChange}
                                />
                            </form>
                        </Modal.Content>

                        <Modal.Actions style={{ paddingTop: 0 }}>
                            <Button className="grey" onClick={this.handleClose} style={{ marginTop: "10px" }}>
                                <Icon name="close" style={{ marginRight: "6px" }} />
                                Close
                            </Button>

                            <Button
                                data-testid={`ConfirmExtraCollateral`}
                                id={`ConfirmExtraCollateral`}
                                disabled={submitting}
                                onClick={this.handleSubmit}
                                content={submitting ? "Submitting..." : "Add collateral"}
                                style={{ marginTop: "10px", marginLeft: "10px" }}
                            />
                        </Modal.Actions>
                    </Modal>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLoading: state.exchange.isLoading,
    userAccount: state.web3Connect.userAccount
});

export default connect(mapStateToProps)(AddCollateralButton);
