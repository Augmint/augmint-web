import React from "react";
import { connect } from "react-redux";
import BaseInfoGroup from "./BaseInfoGroup";
import LoansInfoGroup from "./LoansInfoGroup";
import ExchangeInfoGroup from "./ExchangeInfoGroup";
import { EthereumState } from "containers/app/EthereumState";
import { Grid, Row, Col, PageHeader, Nav, NavItem } from "react-bootstrap";

class underTheHood extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroup: "1"
        };
        this.handleSelectGroup = this.handleSelectGroup.bind(this);
    }
    handleSelectGroup(eventKey) {
        // event.preventDefault();
        this.setState({ selectedGroup: eventKey });
    }

    render() {
        return (
            <Grid>
                <Row>
                    <Col>
                        <EthereumState />
                        <PageHeader>Under the hood</PageHeader>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Nav
                            bsStyle="tabs"
                            activeKey={this.state.selectedGroup}
                            onSelect={this.handleSelectGroup}
                        >
                            <NavItem eventKey="1" title="Base info">
                                <p>Base info</p>
                            </NavItem>
                            <NavItem eventKey="2" title="Loans">
                                <p>Loans</p>
                            </NavItem>
                            <NavItem eventKey="3" title="Exchange">
                                <p>Exchange</p>
                            </NavItem>
                        </Nav>
                    </Col>
                </Row>
                <BaseInfoGroup visible={this.state.selectedGroup === "1"} />
                <LoansInfoGroup visible={this.state.selectedGroup === "2"} />
                <ExchangeInfoGroup visible={this.state.selectedGroup === "3"} />
            </Grid>
        );
    }
}

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(underTheHood);
