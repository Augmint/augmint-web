/*  TODO: add syncing
    TODO: add if pendng transation is there and display confirmation count
*/
import React from "react";
import { connect } from "react-redux";
import Container from "components/augmint-ui/container";
import { StyledP } from "components/augmint-ui/paragraph/styles";
import Header from "components/augmint-ui/header";
import { Link } from "react-router-dom";
import { ErrorDetails, ErrorPanel, WarningPanel, LoadingPanel } from "components/MsgPanels";
import { Tsegment } from "components/TextContent";
import { DiscordButton } from "components/LinkButtons";

import { HowToConnect } from "containers/home/tryIt/HowToConnect.js";

export class EthereumState extends React.Component {
    render() {
        let msg = null;
        const { web3Connect, contracts, augmintToken, extraValidation, className, children = null } = this.props;
        const { network } = web3Connect;

        let _className = className + " primaryColor";

        const isConnecting = web3Connect.isLoading || contracts.isLoading || document.readyState !== "complete";

        const anyConnectionError = web3Connect.error || contracts.error || augmintToken.loadError;

        if (isConnecting) {
            msg = <LoadingPanel header="Connecting to Ethereum network..." />;
        } else if (!web3Connect.isConnected && !web3Connect.isLoading) {
            msg = <HowToConnect />;
        } else if (
            web3Connect.isConnected &&
            !contracts.isLoaded &&
            network.id !== 999 &&
            network.id !== 4 &&
            network.id !== 1976 &&
            network.id !== 4447 &&
            network.id !== 1
        ) {
            msg = (
                <div>
                    <WarningPanel header="Connected to Ethereum but not on Mainnet or Rinkeby" />
                    <StyledP className={_className}>
                        Augmint only works in beta on Mainnet and Rinkeby test network currently
                    </StyledP>
                    <StyledP className={_className}>
                        Your browser seems to be connected to {web3Connect.network.name} network. (id:{" "}
                        {web3Connect.network.id}
                        ).
                    </StyledP>

                    <StyledP className={_className}>Make sure you are connected to Mainnet or Rinkeby</StyledP>
                    <DiscordButton />
                    <StyledP className={_className}>
                        If you feel geeky you can{" "}
                        <Link
                            to="https://github.com/Augmint/augmint-core/blob/master/docs/developmentEnvironment.md"
                            target="_blank"
                        >
                            install it locally
                        </Link>
                        .
                    </StyledP>
                </div>
            );
        } else if (anyConnectionError) {
            msg = (
                <ErrorPanel header="Can't connect to Augmint contracts">
                    <StyledP className={_className}>
                        You seem to be connected to {network.name} but can't connect to Augmint contracts.
                    </StyledP>
                    {network.id === 4 && (
                        <StyledP className={_className}>
                            It's an issue with our deployment, because you are on {network.name} and Augmint contracts
                            should be deployed.
                        </StyledP>
                    )}
                    {network.id !== 4 && (
                        <div>
                            <StyledP className={_className}>Do you have all the contracts deployed?</StyledP>
                            <StyledP className={_className}>
                                See local dev setup instructions on our{" "}
                                <Link
                                    to="https://github.com/Augmint/augmint-core/blob/master/docs/developmentEnvironment.md"
                                    target="_blank"
                                >
                                    Github page
                                </Link>
                            </StyledP>
                        </div>
                    )}

                    <ErrorDetails details={contracts.error} />
                    <ErrorDetails details={augmintToken.loadError} />
                </ErrorPanel>
            );
        } else if (!web3Connect.userAccount) {
            msg = (
                <WarningPanel header="Can't get user acccount">
                    <StyledP className={_className}>
                        Connected to Ethereum {network.name} network but can't get user account.
                    </StyledP>
                    <StyledP className={_className}>If you are using Metamask make sure it's unlocked.</StyledP>
                </WarningPanel>
            );
        } else if (extraValidation) {
            msg = extraValidation();
        }

        if (msg) {
            msg = (
                <Tsegment>
                    <Container>{msg}</Container>
                </Tsegment>
            );
        } else {
            msg = children;
        }
        return msg;
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    loanManager: state.loanManager,
    rates: state.rates,
    augmintToken: state.augmintToken,
    contracts: state.contracts
});

export default (EthereumState = connect(mapStateToProps)(EthereumState));
