import React from "react";
import { connect } from "react-redux";
import BaseInfoGroup from "./BaseInfoGroup";
import LoansInfoGroup from "./LoansInfoGroup";
import AugmintInfoGroup from "./AugmintInfoGroup";
import { connectWeb3 } from "modules/web3Provider";
import ExchangeInfoGroup from "./ExchangeInfoGroup";
import LocksInfoGroup from "./LocksInfoGroup";
import StabilityBoardInfoGroup from "./StabilityBoardInfoGroup";
import PreTokenInfoGroup from "./PreTokenInfoGroup";
import { EthereumState } from "containers/app/EthereumState";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { Menu } from "components/augmint-ui/menu";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";

class underTheHood extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: "baseinfo"
        };
        this.handleSelectGroup = this.handleSelectGroup.bind(this);
    }
    handleSelectGroup(e) {
        this.setState({ selectedGroup: e.target.name });
    }

    componentDidMount() {
        connectWeb3();
    }

    render() {
        const { selectedGroup } = this.state;
        const { isConnected } = this.props.web3Connect;

        return (
            <div>
                <EthereumState />
                <Psegment>
                    {isConnected && (
                        <TopNavTitlePortal>
                            <Pheader header="Under the hood" />
                        </TopNavTitlePortal>
                    )}
                    <Pgrid.Row>
                        <Pgrid.Column>
                            <Menu style={{ overflow: "scroll" }}>
                                <Menu.Item
                                    data-testid="baseInfoLink"
                                    active={selectedGroup === "baseinfo"}
                                    name="baseinfo"
                                    onClick={this.handleSelectGroup}
                                >
                                    Base info
                                </Menu.Item>

                                <Menu.Item
                                    data-testid="augmintInfoLink"
                                    active={selectedGroup === "augmintInfo"}
                                    name="augmintInfo"
                                    onClick={this.handleSelectGroup}
                                >
                                    Augmint info
                                </Menu.Item>

                                <Menu.Item
                                    data-testid="loansInfoLink"
                                    active={selectedGroup === "loans"}
                                    name="loans"
                                    onClick={this.handleSelectGroup}
                                >
                                    Loans
                                </Menu.Item>

                                <Menu.Item
                                    data-testid="locksInfoLink"
                                    active={selectedGroup === "locks"}
                                    name="locks"
                                    onClick={this.handleSelectGroup}
                                >
                                    Locks
                                </Menu.Item>

                                <Menu.Item
                                    data-testid="exchangeInfoLink"
                                    active={selectedGroup === "exchange"}
                                    name="exchange"
                                    onClick={this.handleSelectGroup}
                                >
                                    Exchange
                                </Menu.Item>

                                <Menu.Item
                                    data-testid="stabilityBoardInfoLink"
                                    active={selectedGroup === "stabilityBoard"}
                                    name="stabilityBoard"
                                    onClick={this.handleSelectGroup}
                                >
                                    Stability Board
                                </Menu.Item>

                                <Menu.Item
                                    data-testid="preTokenInfoLink"
                                    active={selectedGroup === "preToken"}
                                    name="preToken"
                                    onClick={this.handleSelectGroup}
                                >
                                    PreToken
                                </Menu.Item>
                            </Menu>

                            {selectedGroup === "baseinfo" && <BaseInfoGroup />}
                            {selectedGroup === "augmintInfo" && <AugmintInfoGroup />}
                            {selectedGroup === "loans" && <LoansInfoGroup />}
                            {selectedGroup === "locks" && <LocksInfoGroup />}
                            {selectedGroup === "exchange" && <ExchangeInfoGroup />}
                            {selectedGroup === "stabilityBoard" && <StabilityBoardInfoGroup />}
                            {selectedGroup === "preToken" && <PreTokenInfoGroup />}
                        </Pgrid.Column>
                    </Pgrid.Row>
                </Psegment>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect
});

export default connect(mapStateToProps)(underTheHood);
