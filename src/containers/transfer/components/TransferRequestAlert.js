import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { Psegment } from "components/PageLayout";
import Button from "components/augmint-ui/button";
import { InfoPanel } from "components/MsgPanels";
import Container from "components/augmint-ui/container";
import { getTransferRequests, getTransferLink, deleteTransferRequest } from "./TransferRequestHelper";

class TransferRequestAlert extends React.Component {
    componentWillMount() {
        this.unlisten = this.props.history.listen(() => {
            this.forceUpdate();
        });
    }
    componentWillUnmount() {
        this.unlisten();
    }
    render() {
        const tokenBalance = this.props.userAccount.tokenBalance;
        const transferRequests = getTransferRequests();
        const requestIndex = transferRequests.findIndex(request => {
            return request.amount <= tokenBalance;
        });
        if (requestIndex >= 0) {
            const request = transferRequests[requestIndex];
            const link = getTransferLink(request);
            const url = new URL(document.location);
            const onDissmiss = () => {
                deleteTransferRequest(requestIndex);
                this.forceUpdate();
            };

            return link !== url.pathname + "?" + url.searchParams ? (
                <Psegment>
                    <Container>
                        <InfoPanel header={`Transfer request to ${request.beneficiary_name}`}>
                            <p style={{ marginBottom: 20 }}>
                                You have a pending transfer request of{" "}
                                <strong>
                                    {request.amount} {request.currency_code} to {request.beneficiary_name}
                                </strong>{" "}
                                ({request.beneficiary_address}
                                ).
                            </p>
                            <Button to={link}>Complete your transfer</Button>
                            <Button style={{ marginLeft: 20 }} className="ghost" onClick={onDissmiss}>
                                Dissmiss
                            </Button>
                        </InfoPanel>
                    </Container>
                </Psegment>
            ) : null;
        }
        return null;
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account
});

export default connect(mapStateToProps)(withRouter(TransferRequestAlert));
