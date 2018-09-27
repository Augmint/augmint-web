import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import { getNetworkName } from "utils/helpers";
import { getTransferRequest } from "./TransferRequestHelper";
import { getTransferFee } from "modules/ethereum/transferTransactions";
import { Psegment, Pblock, Pgrid } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import HashURL from "components/hash";
import Icon from "components/augmint-ui/icon";
import { PageNotFound } from "containers/PageNotFound";
import EthereumState from "containers/app/EthereumState";
import { Validations } from "components/BaseComponents";
import TokenTransferForm from "../components/TokenTransferForm";
import { default as theme, remCalc } from "styles/theme";

class ShowTransferRequest extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            requestId: this.props.match.params.requestId,
            request: null
        };
    }

    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();

        const request = getTransferRequest(this.state.requestId) || null;

        this.setState({
            request
        });
    }

    render() {
        const { web3Connect, augmintToken } = this.props;
        const request = this.state.request;

        if (request) {
            const fee = getTransferFee(request.amount);

            const getErrors = () => {
                const currentNetworkId = web3Connect.network.id;
                const isWrongNetwork = currentNetworkId !== request.network_id;

                if (isWrongNetwork) {
                    const currentNetworkName = getNetworkName(currentNetworkId);
                    const requestNetworkName = getNetworkName(request.network_id);
                    return (
                        <ErrorPanel header="Wrong network">
                            <p>
                                The transfer was requested on <strong>{requestNetworkName} network</strong>. You are
                                currently connected to {currentNetworkName} network.
                                <br />
                                Switch manually to {requestNetworkName} network to complete your transfer.
                            </p>
                        </ErrorPanel>
                    );
                }

                const isNotEnoughToken = Validations.userTokenBalanceWithTransferFee(request.amount);
                if (!augmintToken.isLoading && isNotEnoughToken) {
                    return <ErrorPanel header="Insufficient balance">{isNotEnoughToken}</ErrorPanel>;
                }
            };

            return (
                <Psegment>
                    <Pgrid>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1 }}>
                                <Pblock header={`Transfer request to ${request.beneficiary_name}`}>
                                    <p>
                                        Amount:{" "}
                                        <strong
                                            style={{
                                                fontFamily: theme.typography.fontFamilies.currency,
                                                fontSize: remCalc(24)
                                            }}
                                        >
                                            {request.amount} {request.currency_code}
                                            {!isNaN(fee) && (
                                                <small>
                                                    {" "}
                                                    + {fee} {request.currency_code} fee
                                                </small>
                                            )}
                                        </strong>
                                    </p>
                                    <p>
                                        Address:{" "}
                                        <HashURL
                                            hash={request.beneficiary_address}
                                            network={request.network_id}
                                            type={"address/"}
                                        >
                                            {request.beneficiary_address}
                                        </HashURL>
                                    </p>
                                    <EthereumState extraValidation={getErrors}>
                                        {!augmintToken.isLoading && (
                                            <div>
                                                <p style={{ color: "grey" }}>
                                                    <small>
                                                        <Icon name="warning" style={{ marginRight: 5 }} />
                                                        <i>
                                                            <b>Warning:</b> you are making a transfer to an address
                                                            provided by an external site. Make sure the address belongs
                                                            to {request.beneficiary_name} who you are really willing to
                                                            transfer A-EUR. Funds sent to wrong address might be lost
                                                            irreversibly.
                                                        </i>
                                                    </small>
                                                </p>
                                                {request.notify_url && (
                                                    <p style={{ color: "grey" }}>
                                                        <small>
                                                            If transfer was success, we automatically redirect back to{" "}
                                                            {request.beneficiary_name}.
                                                        </small>
                                                    </p>
                                                )}
                                                <TokenTransferForm
                                                    isFunctional
                                                    initialValues={{
                                                        tokenAmount: request.amount,
                                                        payee: request.beneficiary_address,
                                                        narrative: request.reference
                                                    }}
                                                    urlResolved
                                                    submitText="Approve and send"
                                                />
                                            </div>
                                        )}
                                    </EthereumState>
                                </Pblock>
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            );
        }

        return <PageNotFound location={this.props.location} />;
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    augmintToken: state.augmintToken,
    userAccount: state.userBalances.account
});

export default withRouter(connect(mapStateToProps)(ShowTransferRequest));
