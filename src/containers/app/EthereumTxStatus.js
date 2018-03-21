import React from "react";
import store from "modules/store";
import { connect } from "react-redux";
import { Psegment } from "components/PageLayout";
import { MyListGroup } from "components/MyListGroups";
import { SuccessPanel, EthSubmissionErrorPanel, LoadingPanel } from "components/MsgPanels";
import { Container } from "semantic-ui-react";
import { dismissTx } from "modules/reducers/submittedTransactions";
// import { Modal, Header, Icon, Button } from "semantic-ui-react";
// import { EthSubmissionSuccessPanel } from "components/MsgPanels";

class EthereumTxStatus extends React.Component {
    constructor(props) {
        super(props);
        this.handleClose = this.handleClose.bind(this);
    }

    handleClose(txHash) {
        store.dispatch(dismissTx(txHash));
    }

    render() {
        const { transactions, network } = this.props;

        const txList =
            transactions &&
            Object.keys(transactions).map((hash, _index) => {
                const tx = transactions[hash];
                const index = _index + 1;
                const header = `${index}. ${tx.txName}`;
                if (tx.event === "confirmation") {
                    console.debug("confirmation. tx: ", tx);
                }
                return (
                    <MyListGroup.Row key={`txRowDiv-${hash}`}>
                        {tx.event === "transactionHash" && (
                            <LoadingPanel header={header} onDismiss={() => this.handleClose(tx.transactionHash)}>
                                <p>
                                    Transaction's sent to Ethereum network. Wait for confirmations. <br />
                                    <small>Tx hash: {tx.transactionHash}</small>
                                </p>
                            </LoadingPanel>
                        )}

                        {tx.event === "receipt" &&
                            network.id !== 999 && (
                                <LoadingPanel header={header} onDismiss={() => this.handleClose(tx.transactionHash)}>
                                    <p>
                                        Transaction receipt received. Wait for confirmations.<br />
                                        <small>
                                            Gas used: {tx.receipt.gasUsed}
                                            <br />
                                            Tx hash: {tx.transactionHash}
                                        </small>
                                    </p>
                                </LoadingPanel>
                            )}

                        {tx.event === "receipt" &&
                            network.id === 999 && (
                                <SuccessPanel header={header} onDismiss={() => this.handleClose(tx.transactionHash)}>
                                    <p>
                                        Transaction receipt received, success. (no confirmations on testrpc).<br />
                                        <small>
                                            Gas used: {tx.receipt.gasUsed}
                                            <br />
                                            Tx hash: {tx.transactionHash}
                                        </small>
                                    </p>
                                </SuccessPanel>
                            )}

                        {tx.event === "confirmation" && (
                            <SuccessPanel header={header} onDismiss={() => this.handleClose(tx.transactionHash)}>
                                <p>
                                    {tx.confirmationNumber}. confirmation<br />
                                    <small>
                                        Gas used:{" "}
                                        {tx.receipt
                                            ? tx.receipt.gasUsed
                                            : "waiting for receipt..." /* confirmation 0 doesn't have receipt on Rinkeby */}
                                        <br />
                                        Tx hash: {tx.transactionHash}
                                    </small>
                                </p>
                            </SuccessPanel>
                        )}

                        {tx.event === "error" && (
                            <EthSubmissionErrorPanel
                                header={header}
                                onDismiss={() => this.handleClose(tx.transactionHash)}
                                error={tx.error}
                                receipt={tx.receipt}
                            />
                        )}
                    </MyListGroup.Row>
                );
            });

        return !txList ? null : (
            <Psegment>
                <Container>{txList}</Container>
                {/* <Modal open={true}>
                >
                <Header icon="checkmark" content="Successful Ethereum transaction" onClose={this.handleClose} />
                <Modal.Content>
                    {flash.props.result && flash.props.result.eth ? (
                        <EthSubmissionSuccessPanel header={<h3>{flash.message}</h3>} result={flash.props.result} />
                    ) : (
                        flash.message
                    )}
                </Modal.Content>
                <Modal.Actions>
                    <Button primary data-testid="acknowledgeFlashButton" onClick={this.handleClose}>
                        <Icon name="checkmark" />
                        OK
                    </Button>
                </Modal.Actions>
            </Modal> */}
            </Psegment>
        );
    }
}

function mapStateToProps(state) {
    return {
        transactions: state.submittedTransactions.transactions,
        network: state.web3Connect.network
    };
}

export default connect(mapStateToProps)(EthereumTxStatus);
