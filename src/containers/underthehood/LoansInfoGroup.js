import React from "react";
import { connect } from "react-redux";
import { Pgrid } from "components/PageLayout";
import LoanManagerInfo from "./components/LoanManagerInfo";
import { ArrayDump, stringify } from "./components/ArrayDump";
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
            isLoaded: false,
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
            const isLoaded = true;
            this.setState({ isLoaded, allLoansCsv });
        }
        return true;
    }

    render() {
        if (!this.state.isLoaded) {
            return (
                <Pblock header="Loans">
                    <p>Loading...</p>
                </Pblock>
            );
        }

        const products = (this.props.loanProducts || []).reduce((acc, current) => {
            const address = current.loanManagerAddress;
            if (!acc[address]) {
                acc[address] = [];
            }
            acc[address].push(current);
            return acc;
        }, {});

        return (
            <Pgrid.Row>
                <Pgrid.Column size={{ mobile: 1, tablet: 1, desktop: 1 / 2 }}>
                    <LoanManagerInfo />

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

                    <ArrayDump
                        header={"Loans for userAccount (" + (this.props.loans && this.props.loans.length) + ")"}
                        items={this.props.loans}
                    />
                </Pgrid.Column>

                <Pgrid.Column size={{ mobile: 1, tablet: 1, desktop: 1 / 2 }}>
                    {Object.keys(products).map(address => (
                        <ArrayDump
                            key={address}
                            header={"LoanProducts - " + address + " - (" + products[address].length + ")"}
                            items={products[address]}
                        />
                    ))}
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
