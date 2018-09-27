import React from "react";
import { withRouter } from "react-router";
import { Psegment } from "components/PageLayout";
import Button from "components/augmint-ui/button";
import { InfoPanel } from "components/MsgPanels";
import HashURL from "components/hash";
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
        const transferRequests = getTransferRequests() || [];
        const url = new URL(document.location);

        return transferRequests.length && url.pathname.indexOf("/transfer/") !== 0 ? (
            <Psegment>
                <Container>
                    {transferRequests.map((request, i) => {
                        const link = getTransferLink(request);
                        const onDissmiss = () => {
                            deleteTransferRequest(i);
                            this.forceUpdate();
                        };

                        return (
                            <InfoPanel header={`Transfer request to ${request.beneficiary_name}`} key={i}>
                                <p style={{ marginBottom: 20 }}>
                                    You have a pending transfer request of{" "}
                                    <strong>
                                        {request.amount} {request.currency_code} to {request.beneficiary_name}
                                    </strong>{" "}
                                    (
                                    <HashURL
                                        style={{ color: "inherit" }}
                                        hash={request.beneficiary_address}
                                        network={request.network_id}
                                        type={"address/"}
                                    >
                                        {request.beneficiary_address}
                                    </HashURL>
                                    ).
                                </p>
                                <Button to={link}>Complete your transfer</Button>
                                <Button style={{ marginLeft: 20 }} className="ghost" onClick={onDissmiss}>
                                    Dissmiss
                                </Button>
                            </InfoPanel>
                        );
                    })}
                </Container>
            </Psegment>
        ) : null;
    }
}

export default withRouter(TransferRequestAlert);
