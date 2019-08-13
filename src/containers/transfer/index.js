import React from "react";
import { connect } from "react-redux";
import augmintTokenProvider from "modules/augmintTokenProvider";
import TokenTransferForm from "./components/TokenTransferForm";
import { Pheader, Psegment, Pgrid, Pblock } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import NoTokenAlert from "../account/components/NoTokenAlert";

import "./styles.css";

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
        augmintTokenProvider();
    }

    render() {
        const { augmintToken } = this.props;

        return (
            <EthereumState className="transfer-page">
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Send A-EUR" />
                    </TopNavTitlePortal>

                    <NoTokenAlert />
                    <Pgrid className="transfer">
                        <Pgrid.Row>
                            <Pgrid.Column className="column" size={{ mobile: 1, tablet: 1, desktop: 2 / 5 }}>
                                <Pblock
                                    style={{ margin: 0 }}
                                    loading={
                                        augmintToken.isLoading || (!augmintToken.isLoaded && !augmintToken.loadError)
                                    }
                                >
                                    <TokenTransferForm setPayeeAddress={this.setPayeeAddress} />
                                </Pblock>
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    augmintToken: state.augmintToken
});

export default connect(mapStateToProps)(TransferPage);
