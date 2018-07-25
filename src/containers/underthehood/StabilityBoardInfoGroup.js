import React from "react";
import { connect } from "react-redux";
import stabilityBoardProxyProvider from "modules/stabilityBoardProxyProvider";

import { StabilityBoardProxyInfo } from "./components/StabilityBoardProxyInfo";
import { StabilityBoardScriptsList } from "./components/StabilityBoardScriptsList";
import { StabilityBoardSignersList } from "./components/StabilityBoardSignersList";

import { Pgrid } from "components/PageLayout";

class StabilityBoardInfoGroup extends React.Component {
    componentDidMount() {
        stabilityBoardProxyProvider();
    }

    render() {
        return (
            <Pgrid>
                <Pgrid.Row>
                    <Pgrid.Column size={{ mobile: 1, tablet: 1, desktop: 1 / 2 }}>
                        <StabilityBoardProxyInfo
                            contractData={this.props.stabilityBoardProxyData}
                            contract={this.props.stabilityBoardProxy}
                        />
                        <StabilityBoardSignersList signers={this.props.stabilityBoardProxyData.signers} />
                    </Pgrid.Column>
                    <Pgrid.Column size={{ mobile: 1, tablet: 1, desktop: 1 / 2 }}>
                        <StabilityBoardScriptsList scripts={this.props.stabilityBoardProxyData.scripts} />
                    </Pgrid.Column>
                </Pgrid.Row>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    stabilityBoardProxyData: state.stabilityBoardProxy,
    stabilityBoardProxy: state.contracts.latest.stabilityBoardProxy
});

export default connect(mapStateToProps)(StabilityBoardInfoGroup);
