import React from "react";
import store from "modules/store";
import { connect } from "react-redux";
import BigNumber from "bignumber.js";
import { ONE_ETH_IN_WEI } from "utils/constants";
import { Link } from "react-router-dom";
import { Psegment } from "components/PageLayout";
import { MyListGroup } from "components/MyListGroups";
import { SuccessPanel, EthSubmissionErrorPanel, LoadingPanel } from "components/MsgPanels";
import Container from "components/augmint-ui/container";
import { dismissTx } from "modules/reducers/submittedTransactions";
import HashURL from "components/hash";

class EthereumTxStatus extends React.Component {
    constructor(props) {
        super(props);
        this.handleClose = this.handleClose.bind(this);
    }

    handleClose(txHash) {
        store.dispatch(dismissTx(txHash));
    }

    render() {
        const { transactions, network, decimalsDiv, showNotificationPanel } = this.props;

        const txList =
            transactions &&
            Object.keys(transactions)
                // .filter(hash => !transactions[hash].isDismissed)
                .filter(
                    hash => (showNotificationPanel === "open" ? transactions[hash] : !transactions[hash].isDismissed)
                )
                .map((hash, _index) => {
                    const tx = transactions[hash];
                    const index = _index + 1;
                    const header = `${index}. ${tx.txName}`;
                    let txInfo;
                    let orderId;

                    const gasUsed = tx.receipt ? tx.receipt.gasUsed : "waiting for receipt...";

                    if (tx.receipt && tx.receipt.events.NewLoan) {
                        const vals = tx.receipt.events.NewLoan.returnValues;

                        const loanAmount = parseInt(vals.loanAmount, 10) / decimalsDiv;
                        const repaymentAmount = parseInt(vals.repaymentAmount, 10) / decimalsDiv;
                        const collateralEth = new BigNumber(vals.collateralAmount).div(ONE_ETH_IN_WEI).toString();
                        txInfo = (
                            <div>
                                <p>
                                    You've a new loan. Don't forget to pay it back on maturity to get back your
                                    collateral.
                                </p>
                                <p>
                                    You can always check your the status of your loan on{" "}
                                    <Link to="/account">My account page</Link>
                                    <br />
                                    or directly on <Link to={"/loan/" + vals.loanId}>this loan's page</Link>
                                </p>
                                <p>Disbursed: {loanAmount} A-EUR</p>
                                <p>To be repaid: {repaymentAmount} A-EUR</p>
                                <p>Collateral in escrow: {collateralEth} ETH</p>
                                <p>
                                    Loan id: {vals.loanId} | Product id: {vals.productId} | borrower: {vals.borrower}
                                </p>
                            </div>
                        );
                    }

                    if (tx.receipt && tx.receipt.events.NewOrder) {
                        orderId = tx.receipt.events.NewOrder.returnValues.orderId;
                        txInfo = <p>Order id: {orderId}</p>;
                    }

                    return (
                        <MyListGroup.Row key={`txRowDiv-${hash}`}>
                            {/* <MyListGroup.Row key={`txRowDiv-${hash}`} className={this.props.showNotificationPanel ? "notifications open" : ""}> */}
                            {tx.event === "transactionHash" && (
                                <LoadingPanel
                                    header={header}
                                    onDismiss={() => this.handleClose(tx.transactionHash)}
                                    btn="noBtn"
                                    // style={{ position: "fixed", top: "60px", right: "17px", zIndex: "100" }}
                                >
                                    <p>
                                        Transaction's sent to Ethereum network. Wait for confirmations. <br />
                                        <HashURL hash={tx.transactionHash} type={"tx/"} />
                                    </p>
                                </LoadingPanel>
                            )}

                            {tx.event === "receipt" &&
                                network.id !== 999 && (
                                    <LoadingPanel
                                        header={header}
                                        onDismiss={() => this.handleClose(tx.transactionHash)}
                                        btn="noBtn"
                                        // style={{ position: "fixed", top: "60px", right: "17px", zIndex: "100" }}
                                    >
                                        <p>Transaction receipt received. Wait for confirmations.</p>

                                        {txInfo}

                                        <p>
                                            <small>
                                                Gas used: {gasUsed}
                                                <br />
                                                <HashURL hash={tx.transactionHash} type={"tx/"} />
                                            </small>
                                        </p>
                                    </LoadingPanel>
                                )}

                            {tx.event === "confirmation" && (
                                <SuccessPanel
                                    data-testid="EthConfirmationReceivedPanel"
                                    data-test-orderid={orderId}
                                    data-test-gasused={gasUsed}
                                    header={header}
                                    onDismiss={() => this.handleClose(tx.transactionHash)}
                                    btn="noBtn"
                                    // style={{ position: "fixed", top: "60px", right: "17px", zIndex: "100" }}
                                >
                                    <p>{tx.confirmationNumber}. confirmation</p>

                                    {txInfo}

                                    <p>
                                        <small>
                                            Gas used: {gasUsed}
                                            <br />
                                            <HashURL hash={tx.transactionHash} type={"tx/"} />
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
            <Psegment style={{ margin: "0 auto", padding: "0" }}>
                <Container>{txList}</Container>
            </Psegment>
        );
    }
}

function mapStateToProps(state) {
    return {
        transactions: state.submittedTransactions.transactions,
        decimalsDiv: state.augmintToken.info.decimalsDiv,
        network: state.web3Connect.network
    };
}

export default connect(mapStateToProps)(EthereumTxStatus);
