import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import TokenTransferForm from "./components/TokenTransferForm";
import { Pheader, Psegment, Pgrid, Pblock } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import NoTokenAlert from "../account/components/NoTokenAlert";
import { Menu } from "components/augmint-ui/menu/index.jsx";

const DELEGATED = 1;
const NOT_DELEGATED = 0;

class TransferPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { delegated: false };
        this.onTypeChange = this.onTypeChange.bind(this);
    }

    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
    }

    onTypeChange(e) {
        this.setState({ delegated: +e.target.attributes["data-index"].value === DELEGATED });
    }

    render() {
        const { augmintToken } = this.props;
        const { delegated } = this.state;
        const header = (
            <div>
                <Menu style={{ marginBottom: -11 }}>
                    <Menu.Item
                        active={!delegated}
                        data-index={NOT_DELEGATED}
                        onClick={this.onTypeChange}
                        data-testid="tokenTransfer"
                        className={"buySell"}
                    >
                        Send A-EUR
                    </Menu.Item>
                    <Menu.Item
                        active={delegated}
                        data-index={DELEGATED}
                        onClick={this.onTypeChange}
                        data-testid="delegatedTokenTransfer"
                        className={"buySell"}
                    >
                        Send via ATX
                    </Menu.Item>
                </Menu>
            </div>
        );

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
                                    header={header}
                                >
                                    <TokenTransferForm delegated={delegated} />
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
    augmintToken: state.augmintToken,
    userAccount: state.userBalances.account
});

export default connect(mapStateToProps)(TransferPage);
