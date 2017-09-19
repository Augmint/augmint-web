import React from "react";
import BaseInfoGroup from "./BaseInfoGroup";
import LoansInfoGroup from "./LoansInfoGroup";
import ExchangeInfoGroup from "./ExchangeInfoGroup";
import { EthereumState } from "containers/app/EthereumState";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { Menu } from "semantic-ui-react";

export default class underTheHood extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: "baseinfo"
        };
        this.handleSelectGroup = this.handleSelectGroup.bind(this);
    }
    handleSelectGroup(e, { name }) {
        this.setState({ selectedGroup: name });
    }

    render() {
        const { selectedGroup } = this.state;
        return (
            <div>
                <EthereumState />
                <Psegment>
                    <Pheader header="Under the hood" />

                    <Pgrid columns={1}>
                        <Pgrid.Column>
                            <Menu size="massive" tabular>
                                <Menu.Item
                                    active={selectedGroup === "baseinfo"}
                                    name="baseinfo"
                                    onClick={this.handleSelectGroup}
                                >
                                    Base info
                                </Menu.Item>
                                <Menu.Item
                                    active={selectedGroup === "loans"}
                                    name="loans"
                                    onClick={this.handleSelectGroup}
                                >
                                    Loans
                                </Menu.Item>
                                <Menu.Item
                                    active={selectedGroup === "exchange"}
                                    name="exchange"
                                    onClick={this.handleSelectGroup}
                                >
                                    Exchange
                                </Menu.Item>
                            </Menu>

                            {selectedGroup === "baseinfo" && <BaseInfoGroup />}
                            {selectedGroup === "loans" && <LoansInfoGroup />}
                            {selectedGroup === "exchange" && (
                                <ExchangeInfoGroup />
                            )}
                        </Pgrid.Column>
                    </Pgrid>
                </Psegment>
            </div>
        );
    }
}
