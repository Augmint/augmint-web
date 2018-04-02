import React from "react";
import store from "modules/store";
import { connect } from "react-redux";
import legacyBalancesProvider from "modules/legacyBalancesProvider";
import { Psegment } from "components/PageLayout";
import { MyListGroup } from "components/MyListGroups";
//import { SuccessPanel, EthSubmissionErrorPanel, LoadingPanel } from "components/MsgPanels";
import Button from "components/button";
import { InfoPanel } from "components/MsgPanels";
import { Container } from "semantic-ui-react";
import { dismissLegacyBalance, convertLegacyBalance } from "modules/reducers/legacyBalances";

class LegacyTokens extends React.Component {
    constructor(props) {
        super(props);
        this.handleDismiss = this.handleDismiss.bind(this);
        this.submitConvert = this.submitConvert.bind(this);
    }

    componentDidMount() {
        legacyBalancesProvider();
    }

    handleDismiss(legacyTokenAddress) {
        store.dispatch(dismissLegacyBalance(legacyTokenAddress));
    }

    submitConvert(legacyTokenAddress) {
        store.dispatch(convertLegacyBalance(legacyTokenAddress));
    }

    render() {
        const { contractBalances, augmintToken, network } = this.props;

        const balances = contractBalances
            ? contractBalances.filter(item => item.balance > 0 && !item.isDismissed).map(item => {
                  return (
                      <MyListGroup.Row key={`txRowDiv-${item.contract}`}>
                          Balance in legacy contract: {item.balance} A-EUR{" "}
                          <small>Contract address: {item.contract} </small>
                          <Button
                              type="submit"
                              data-testid={`dismissLegacyBalanceButton-${item.contract}`}
                              onClick={() => this.handleDismiss(item.contract)}
                          >
                              Dismiss
                          </Button>
                          <Button
                              type="submit"
                              primary
                              data-testid={`convertLegacyBalanceButton-${item.contract}`}
                              onClick={() => this.submitConvert(item.contract)}
                          >
                              Convert
                          </Button>
                      </MyListGroup.Row>
                  );
              })
            : null;

        return balances && balances.length > 0 && augmintToken.isConnected ? (
            <Psegment>
                <Container>
                    <InfoPanel header="You have A-EUR in an older version of Augmint token contract">
                        <p>
                            There is newer Augmint A-EUR Token version deployed to the {network.name} network at{" "}
                            {augmintToken.contract.address}.
                            <br />
                            You can convert your old A-EUR balance to the new contract.<br />
                            <small>
                                NB: token contract upgrades will be infrequent (ideally not needed at all) when Augmint
                                released in public. During pilots we deliberately deploy a couple of new versions to
                                test the conversion process.
                            </small>
                        </p>
                        {balances}
                    </InfoPanel>
                </Container>
            </Psegment>
        ) : null;
    }
}

function mapStateToProps(state) {
    return {
        contractBalances: state.legacyBalances.contractBalances,
        augmintToken: state.augmintToken,
        network: state.web3Connect.network
    };
}

export default connect(mapStateToProps)(LegacyTokens);
