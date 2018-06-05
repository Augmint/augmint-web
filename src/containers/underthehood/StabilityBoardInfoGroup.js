import React from "react";
import { connect } from "react-redux";
import stabilityBoardSignerProvider from "modules/stabilityBoardSignerProvider";

import { StabilityBoardSignerInfo } from "./components/StabilityBoardSignerInfo";
import { StabilityBoardScriptsList } from "./components/StabilityBoardScriptsList";
import { StabilityBoardSignersList } from "./components/StabilityBoardSignersList";

import { Pgrid } from "components/PageLayout";

class StabilityBoardInfoGroup extends React.Component {
    componentDidMount() {
        stabilityBoardSignerProvider();
    }

    render() {
        return (
            <Pgrid>
                <Pgrid.Row wrap={false}>
                    <Pgrid.Column size={10 / 32}>
                        <StabilityBoardSignerInfo
                            contractData={this.props.stabilityBoardSignerData}
                            contract={this.props.stabilityBoardSigner}
                        />
                    </Pgrid.Column>
                    <Pgrid.Column size={11 / 32}>
                        <StabilityBoardScriptsList scripts={this.props.stabilityBoardSignerData.scripts} />
                    </Pgrid.Column>
                    <Pgrid.Column size={11 / 32}>
                        <StabilityBoardSignersList signers={this.props.stabilityBoardSignerData.signers} />
                    </Pgrid.Column>
                </Pgrid.Row>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    stabilityBoardSignerData: state.stabilityBoardSigner,
    stabilityBoardSigner: state.contracts.latest.stabilityBoardSigner
});

export default connect(mapStateToProps)(StabilityBoardInfoGroup);
