import React from "react";
import { connect } from "react-redux";
import legacyLoanManagersProvider from "modules/legacyLoanManagersProvider";
import { Psegment } from "components/PageLayout";
import { MyListGroup } from "components/MyListGroups";
import { EthSubmissionSuccessPanel, EthSubmissionErrorPanel } from "components/MsgPanels";
import Button from "components/augmint-ui/button";
import { InfoPanel } from "components/MsgPanels";
import Container from "components/augmint-ui/container";
import {
    dismissLegacyLoanManager,
    repayLegacyLoan,
    collectLegacyLoans,
    LEGACY_LOANMANAGERS_REPAY_SUCCESS,
    LEGACY_LOANMANAGERS_COLLECT_SUCCESS
} from "modules/reducers/legacyLoanManagers";

const styleP = { margin: "1rem 0" };

class LegacyLoanManagers extends React.Component {
    constructor(props) {
        super(props);
        this.handleDismiss = this.handleDismiss.bind(this);
        this.submitRepayLoan = this.submitRepayLoan.bind(this);
        this.submitCollectLoan = this.submitCollectLoan.bind(this);
        this.state = {
            submitting: false,
            submitSucceeded: false,
            error: null,
            result: null
        };
    }

    componentDidMount() {
        legacyLoanManagersProvider();
    }

    handleDismiss(legacyLockerAddress) {
        this.props.dismissLegacyLoanManager(legacyLockerAddress);
    }

    async submitRepayLoan(legacyLoanManagerAddress, repaymentAmount, loanId) {
        this.setState({ submitting: true, error: null, result: null });
        const res = await this.props.repayLegacyLoan(legacyLoanManagerAddress, repaymentAmount, loanId);
        if (res.type !== LEGACY_LOANMANAGERS_REPAY_SUCCESS) {
            this.setState({
                submitting: false,
                error: res.error
            });
        } else {
            this.setState({
                submitting: false,
                submitSucceeded: true,
                error: null,
                result: res.result
            });
            return;
        }
    }

    async submitCollectLoan(legacyLoanManagerAddress, loan) {
        this.setState({ submitting: true, error: null, result: null });
        const res = await this.props.collectLegacyLoans(legacyLoanManagerAddress, [loan]);
        if (res.type !== LEGACY_LOANMANAGERS_COLLECT_SUCCESS) {
            this.setState({
                submitting: false,
                error: res.error
            });
        } else {
            this.setState({
                submitting: false,
                submitSucceeded: true,
                error: null,
                result: res.result
            });
            return;
        }
    }

    render() {
        const { contracts, loanManagerContract, network } = this.props;
        const { error, submitting, submitSucceeded, result } = this.state;

        const loans = contracts
            .filter(contract => contract.loans.length > 0 && !contract.isDismissed)
            .map((contract, contractIndex) => (
                <MyListGroup.Col key={`contractColDiv-${contractIndex}`} size={1}>
                    <p style={styleP}>
                        {contract.loans.length} loans in legacy Loan contract: <small> {contract.address} </small>
                    </p>

                    <p style={styleP}>
                        <Button
                            type="submit"
                            data-testid={`dismissLegacyLoanManagerButton-${contractIndex}`}
                            onClick={() => this.handleDismiss(contract.address)}
                        >
                            Dismiss
                        </Button>
                    </p>

                    {contract.loans.map((loan, loanIndex) => (
                        <MyListGroup.Row key={`loansDiv-${contractIndex}-${loan.id}`}>
                            <p style={styleP}>
                                Loan id: {loan.id} Repayment amount: {loan.repaymentAmount} A€
                            </p>
                            {loan.isRepayable ? (
                                <p style={styleP}>This loan is due on {loan.maturityText}</p>
                            ) : (
                                <p style={styleP}>This loan wasn't repayed on time ( before {loan.maturityText})</p>
                            )}

                            {loan.isSubmitted ? (
                                <p style={styleP}>
                                    Loan transaction submitted, wait for confirmations then refresh page
                                </p>
                            ) : loan.isRepayable ? (
                                contract.userTokenBalance < loan.repaymentAmount ? (
                                    <p style={styleP}>
                                        You have insufficient balance in old token contract to repay this loan. Your
                                        balance: {contract.userTokenBalance} A€ in token contract at
                                        <small>{contract.tokenAddress}</small>
                                    </p>
                                ) : (
                                    <Button
                                        type="submit"
                                        primary
                                        disabled={submitting}
                                        data-testid={`repayLegacyLoanButton-${contractIndex}-${loan.id}`}
                                        onClick={() =>
                                            this.submitRepayLoan(contract.address, loan.repaymentAmount, loan.id)
                                        }
                                    >
                                        {submitting ? "Submitting tx..." : loan.isDue ? "Repay" : "Repay early"}
                                    </Button>
                                )
                            ) : loan.isCollectable ? (
                                <Button
                                    type="submit"
                                    primary
                                    disabled={submitting}
                                    data-testid={`collectLegacyLoanButton-${contractIndex}-${loan.id}`}
                                    onClick={() => this.submitCollectLoan(contract.address, loan)}
                                >
                                    {submitting ? "Submitting tx..." : "Collection"}
                                </Button>
                            ) : (
                                <p style={styleP}>Unexpected loan status: {loan.status}</p>
                            )}
                        </MyListGroup.Row>
                    ))}
                </MyListGroup.Col>
            ));

        return loans && loans.length > 0 && loanManagerContract ? (
            <Psegment>
                <Container>
                    <InfoPanel header="You have loan(s) in an older version of Augmint LoanManager contract">
                        <p style={styleP}>
                            Augmint LoanManager version in use on {network.name} network at{" "}
                            {loanManagerContract.address}.
                            <br />
                            You can repay your loan in the old loan contract or collect and release leftover collateral
                            if it's defaulted .<br />
                            <small>
                                NB: LoanManger contract upgrades will be infrequent when Augmint released in public.
                                During pilots we deliberately deploy a couple of new versions to test the conversion
                                process.
                            </small>
                        </p>
                        {error && (
                            <EthSubmissionErrorPanel
                                error={error}
                                header="Legacy loan tx failed"
                                onDismiss={() => this.setState({ error: null })}
                            />
                        )}
                        {submitSucceeded && (
                            <EthSubmissionSuccessPanel
                                header="Legacy loan tx  submitted"
                                result={result}
                                onDismiss={() => this.setState({ submitSucceeded: false, result: null })}
                            />
                        )}
                        {!submitSucceeded && !error && loans}
                    </InfoPanel>
                </Container>
            </Psegment>
        ) : null;
    }
}

function mapStateToProps(state) {
    return {
        contracts: state.legacyLoanManagers.contracts,
        loanManagerContract: state.contracts.latest.loanManager,
        network: state.web3Connect.network
    };
}

const mapDispatchToProps = { dismissLegacyLoanManager, repayLegacyLoan, collectLegacyLoans };

export default connect(mapStateToProps, mapDispatchToProps)(LegacyLoanManagers);
