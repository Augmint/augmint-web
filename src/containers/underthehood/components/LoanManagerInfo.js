import React from "react";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { connect } from "react-redux";

class LoanManagerInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loanCounts: [] };
        this.handleRefreshClick = this.handleRefreshClick.bind(this);
    }

    async refreshCounts() {
        const augmint = this.props.augmint;
        const loanCounts = await augmint.getLoanCounts();
        this.setState({ loanCounts });
    }

    handleRefreshClick(e) {
        e.preventDefault();
        this.refreshCounts();
    }

    componentDidMount() {
        this.refreshCounts();
    }

    render() {
        return (
            <Pblock header="LoanManager">
                <p>LoanCount: </p>
                {this.state.loanCounts.map((li, i) => (
                    <p key={i}>
                        {li.loanManagerAddress}: {li.loanCount}
                    </p>
                ))}
                <ContractBaseInfo refreshCb={this.handleRefreshClick} {...this.props} />
            </Pblock>
        );
    }
}

export default connect(state => ({
    augmint: state.web3Connect.augmint
}))(LoanManagerInfo);
