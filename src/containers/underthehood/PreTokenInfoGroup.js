import React from "react";
import { connect } from "react-redux";
import preTokenProvider from "modules/preTokenProvider";

import { PreTokenInfo } from "./components/PreTokenInfo";
import { PreTokenTransferList } from "./components/PreTokenTransferList";
import { PreTokenAccountInfo } from "./components/PreTokenAccountInfo";

import { Pgrid } from "components/PageLayout";

class PreTokenInfoGroup extends React.Component {
    componentDidMount() {
        preTokenProvider();
    }

    render() {
        return (
            <Pgrid>
                <Pgrid.Row wrap={false}>
                    <Pgrid.Column size={16 / 32}>
                        <PreTokenInfo contractData={this.props.preTokenData} contract={this.props.preToken} />
                    </Pgrid.Column>
                    <Pgrid.Column size={16 / 32}>
                        <PreTokenAccountInfo preTokenData={this.props.preTokenData} />
                        <PreTokenTransferList preTokenData={this.props.preTokenData} />
                    </Pgrid.Column>
                </Pgrid.Row>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    preTokenData: state.preToken,
    preToken: state.contracts.latest.preToken
});

export default connect(mapStateToProps)(PreTokenInfoGroup);
