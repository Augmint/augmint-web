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
import theme from "styles/theme";

class TransferPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            payeeEthAddress: "",
            displayEthTransferForm: false
        };
        this.setPayeeAddress = this.setPayeeAddress.bind(this);
        this.toggleEthTransferForm = this.toggleEthTransferForm.bind(this);
    }

    setPayeeAddress(payeeEthAddress) {
        this.setState({
            payeeEthAddress
        });
    }

    toggleEthTransferForm(e, payeeEthAddress) {
        this.setPayeeAddress(payeeEthAddress);
        this.setState({
            displayEthTransferForm: e
        });
    }

    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
    }

    render() {
        const { augmintToken, userBalances } = this.props;

        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Send A-EUR" />
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
                                        setPayeeAddress={this.setPayeeAddress}
                                        toggleEthTransferForm={this.toggleEthTransferForm}
                                    />
                                </Pblock>
                                {this.state.displayEthTransferForm && (
                                    <Pblock
                                        loading={userBalances.isLoading}
                                        // header="The recipient/payee needs ETH to cover transaction fees, but does not have any... Care to help?"
                                        header="Care to help?"
                                        style={{ marginTop: 0, backgroundColor: theme.colors.secondaryXLight }}
                                    >
                                        <EthTransferForm
                                            address={this.state.payeeEthAddress}
                                            toggleEthTransferForm={this.toggleEthTransferForm}
                                        />
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
    userBalances: state.userBalances
});

export default connect(mapStateToProps)(TransferPage);
