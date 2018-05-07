import React from "react";
import { connect } from "react-redux";
import legacyBalancesProvider from "modules/legacyBalancesProvider";
import { Psegment } from "components/PageLayout";
import { MyListGroup } from "components/MyListGroups";
import { EthSubmissionSuccessPanel, EthSubmissionErrorPanel } from "components/MsgPanels";
import Button from "components/augmint-ui/button";
import { InfoPanel } from "components/MsgPanels";
import Container from "components/augmint-ui/container";
import {
    dismissLegacyBalance,
    convertLegacyBalance,
    LEGACY_BALANCE_CONVERSION_SUCCESS
} from "modules/reducers/legacyBalances";

class LegacyTokens extends React.Component {
    constructor(props) {
        super(props);
        this.handleDismiss = this.handleDismiss.bind(this);
        this.submitConvert = this.submitConvert.bind(this);
        this.state = {
            submitting: false,
            submitSucceeded: false,
            error: null,
            result: null
        };
    }

    componentDidMount() {
        legacyBalancesProvider();
    }

    handleDismiss(legacyTokenAddress) {
        this.props.dismissLegacyBalance(legacyTokenAddress);
    }

    async submitConvert(legacyTokenAddress, amount) {
        this.setState({ submitting: true, error: null, result: null });
        const res = await this.props.convertLegacyBalance(legacyTokenAddress, amount);
        if (res.type !== LEGACY_BALANCE_CONVERSION_SUCCESS) {
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
        const { contractBalances, augmintTokenContract, network } = this.props;
        const { error, submitting, submitSucceeded, result } = this.state;

        const balances = contractBalances
            ? contractBalances.filter(item => item.balance > 0 && !item.isDismissed).map(item => (
                  <MyListGroup.Row key={`txRowDiv-${item.contract}`}>
                      Balance in legacy contract: {item.balance} A-EUR <small>Contract address: {item.contract} </small>
                      <Button
                          type="submit"
                          data-testid={`dismissLegacyBalanceButton-${item.contract}`}
                          onClick={() => this.handleDismiss(item.contract)}
                      >
                          Dismiss
                      </Button>
                      <Button
                          type="submit"
                          disabled={submitting}
                          data-testid={`convertLegacyBalanceButton-${item.contract}`}
                          onClick={() => this.submitConvert(item.contract, item.balance)}
                      >
                          {submitting ? "Submitting convert..." : "Convert"}
                      </Button>
                  </MyListGroup.Row>
              ))
            : null;

        return balances && balances.length > 0 && augmintTokenContract ? (
            <Psegment>
                <Container>
                    <InfoPanel header="You have A-EUR in an older version of Augmint token contract">
                        <p>
                            There is newer Augmint A-EUR Token version deployed to the {network.name} network at{" "}
                            {augmintTokenContract.address}.
                            <br />
                            You can convert your old A-EUR balance to the new contract.<br />
                            <small>
                                NB: token contract upgrades will be infrequent (ideally not needed at all) when Augmint
                                released in public. During pilots we deliberately deploy a couple of new versions to
                                test the conversion process.
                            </small>
                        </p>
                        {error && (
                            <EthSubmissionErrorPanel
                                error={error}
                                header="Legacy token conversion failed"
                                onDismiss={() => this.setState({ error: null })}
                            />
                        )}
                        {submitSucceeded && (
                            <EthSubmissionSuccessPanel
                                header="Token conversion submitted"
                                result={result}
                                onDismiss={() => this.setState({ submitSucceeded: false, result: null })}
                            />
                        )}
                        {!submitSucceeded && !error && balances}
                    </InfoPanel>
                </Container>
            </Psegment>
        ) : null;
    }
}

function mapStateToProps(state) {
    return {
        contractBalances: state.legacyBalances.contractBalances,
        augmintTokenContract: state.contracts.latest.augmintToken,
        network: state.web3Connect.network
    };
}

const mapDispatchToProps = { dismissLegacyBalance, convertLegacyBalance };

export default connect(mapStateToProps, mapDispatchToProps)(LegacyTokens);
