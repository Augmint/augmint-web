import React from "react";
import { connect } from "react-redux";
import { Pgrid } from "components/PageLayout";
import LoanManagerInfo from "./components/LoanManagerInfo";
import { ArrayDump } from "./components/ArrayDump";
import loanManagerProvider from "modules/loanManagerProvider";
import { fetchAllLoans } from "modules/reducers/loans";
import store from "modules/store";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Button from "components/augmint-ui/button";
import { Pblock } from "components/PageLayout";

const jsonToCsv = json => {
    let csv;
    if (json) {
        const replacer = (key, value) => (value === null ? "null" : value);
        const header = Object.keys(json[0]);
        csv = json.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join("\t"));
        csv.unshift(header.join("\t"));

        csv = csv.join("\r\n");
    }
    return csv;
};
class LoansInfoGroup extends React.Component {
    constructor() {
        super();
        this.state = {
            allLoansCsv: null
        };
    }
    componentDidMount() {
        loanManagerProvider();
        store.dispatch(fetchAllLoans());
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.allLoans !== this.props.allLoans) {
            const allLoansCsv = jsonToCsv(nextProps.allLoans);
            this.setState({ allLoansCsv });
        }
        return true;
    }

    render() {
        return (
            <Pgrid.Row>
                <Pgrid.Column size={{ mobile: 1, tablet: 1, desktop: 1 / 2 }}>
                    <LoanManagerInfo contractData={this.props.loanManagerData} contract={this.props.loanManager} />
                    <ArrayDump header="Loans for userAccount" items={this.props.loans} />

                    <Pblock header="All loans">
                        <CopyToClipboard
                            text={this.state.allLoansCsv ? this.state.allLoansCsv : "<loans not loaded>"}
                            onCopy={result => {
                                if (result) {
                                    alert(`${this.props.allLoans.length} loans copied to clipboard`);
                                } else {
                                    alert("copy failed");
                                }
                            }}
                        >
                            <Button size="small" disabled={!this.props.allLoans}>
                                {this.props.allLoans
                                    ? `Copy ${this.props.allLoans.length} loans to clipboard`
                                    : "No loans loaded"}
                            </Button>
                        </CopyToClipboard>
                    </Pblock>
                </Pgrid.Column>

                <Pgrid.Column size={{ mobile: 1, tablet: 1, desktop: 1 / 2 }}>
                    <ArrayDump header="Loan Products" items={this.props.loanProducts} />
                </Pgrid.Column>
            </Pgrid.Row>
        );
    }
}

const mapStateToProps = state => ({
    loanManager: state.contracts.latest.loanManager,
    loanManagerData: state.loanManager,
    loanProducts: state.loanManager.products,
    loans: state.loans.loans,
    allLoans: state.loans.allLoans
});

export default connect(mapStateToProps)(LoansInfoGroup);
