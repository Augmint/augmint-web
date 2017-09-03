import React from "react";
import { connect } from "react-redux";
import { Row, Col, Panel } from "react-bootstrap";
import { LoanManagerInfo } from "./LoanManagerInfo";
import { ArrayDump } from "./ArrayDump";
import loanManagerProvider from "modules/loanManagerProvider";

class LoansInfoGroup extends React.Component {
    componentDidMount() {
        loanManagerProvider();
    }

    render() {
        const { loanManager, loanProducts, loans, visible } = this.props;
        return !visible ? null : (
            <Row>
                <Col xs={12} sm={4}>
                    <LoanManagerInfo contract={loanManager} />
                </Col>
                <Col xs={12} sm={4}>
                    <Panel header={<h3>Loan Products</h3>}>
                        <ArrayDump items={loanProducts} />
                    </Panel>
                </Col>
                <Col xs={12} sm={4}>
                    <Panel header={<h3>Loans for userAccount</h3>}>
                        <ArrayDump items={loans} />
                    </Panel>
                </Col>
            </Row>
        );
    }
}

const mapStateToProps = state => ({
    loanManager: state.loanManager,
    loanProducts: state.loanManager.products,
    loans: state.loans.loans
});

export default connect(mapStateToProps)(LoansInfoGroup);
