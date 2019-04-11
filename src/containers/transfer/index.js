import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import TokenTransferForm from "./components/TokenTransferForm";
import EthTransferForm from "./components/EthTransferForm";
import { Pheader, Psegment, Pgrid, Pblock } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import NoTokenAlert from "../account/components/NoTokenAlert";

class TransferPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            payeeEthAddress: ""
        };
        this.setPayeeAddress = this.setPayeeAddress.bind(this);
    }

    setPayeeAddress(payeeEthAddress) {
        this.setState({
            payeeEthAddress
        });
    }

    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
    }

    render() {
        const { augmintToken } = this.props;

        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Transfer A-EUR" />
                    </TopNavTitlePortal>

                    <NoTokenAlert style={{ margin: "0 15px 5px" }} />
                    <Pgrid>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2 }}>
                                <Pblock
                                    loading={
                                        augmintToken.isLoading || (!augmintToken.isLoaded && !augmintToken.loadError)
                                    }
                                    header="Send A-EUR"
                                    style={{ marginBottom: 1 }}
                                >
                                    <TokenTransferForm
                                        // setEthBalance={this.setEthBalance}
                                        setPayeeAddress={this.setPayeeAddress}
                                    />
                                </Pblock>
                                {this.state.payeeEthAddress !== "" && (
                                    <Pblock
                                        loading={
                                            augmintToken.isLoading || // TODO change augmintToken to something else
                                            (!augmintToken.isLoaded && !augmintToken.loadError)
                                        }
                                        header="The recipient/payee needs ETH to cover transaction fees, but does not have any... Care to help?"
                                        style={{ marginTop: 0, backgroundColor: "#f9db9c" }}
                                    >
                                        <EthTransferForm address={this.state.payeeEthAddress} />
                                    </Pblock>
                                )}
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    augmintToken: state.augmintToken,
    userAccount: state.userBalances.account
});

export default connect(mapStateToProps)(TransferPage);
