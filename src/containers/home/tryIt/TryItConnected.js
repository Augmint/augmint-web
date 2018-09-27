import React from "react";
import { Tsegment, Tblock } from "components/TextContent";
import { Link } from "react-router-dom";
import { EthereumState } from "containers/app/EthereumState";
import { SuccessPanel } from "components/MsgPanels";
import { DiscordButton, TelegramButton } from "components/LinkButtons";
import { StyledP } from "components/augmint-ui/paragraph/styles";
import Video from "components/augmint-ui/video";
import { MrCoinBuyLink } from "components/ExchangeLinks";

export function TryItConnected(props) {
    const { className, web3Connect } = props;
    let _className = className + " primaryColor";

    console.log(web3Connect.network);
    return (
        <EthereumState>
            <Tsegment style={{ padding: "2em 1em" }}>
                <SuccessPanel
                    data-testid="TryItConnectedPanel"
                    header={`Great! You are connected to ${web3Connect.network.name} network`}
                />

                {(web3Connect.network.id === 1 || web3Connect.network.id === 4) && (
                    <Tblock header="Get ETH" headerStyle={"primaryColor"}>
                        <StyledP className={_className}>
                            You need ETH to send transactions to the Ethereum network (e.g. send A-EUR or buy for ETH).
                        </StyledP>
                        <StyledP className={_className}>
                            To get real ETH on mainnet see{" "}
                            <a
                                href="https://cointelegraph.com/ethereum-for-beginners/how-to-buy-ethereum"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                this guide
                            </a>
                            .
                        </StyledP>
                        <StyledP className={_className}>
                            For trying out Augmint on Rinkeby test network get test ethers on{" "}
                            <a href="https://faucet.rinkeby.io/" target="_blank" rel="noopener noreferrer">
                                faucet.rinkeby.io
                            </a>{" "}
                            or checkout our video:
                        </StyledP>

                        <Video
                            title="connect to rinkeby"
                            src="https://www.youtube.com/embed/0APcMesrZ_U"
                            host="https://www.youtube.com"
                        />
                    </Tblock>
                )}

                <Tblock header="Get A-EUR" headerStyle={"primaryColor"}>
                    <StyledP className={_className}>
                        <Link to="/loan/new">Take a loan </Link> for leaving your ETH in escrow and receive A-EUR.
                    </StyledP>
                </Tblock>

                <Tblock header="Buy A-EUR" headerStyle={"primaryColor"}>
                    <StyledP className={_className}>
                        Buy A-EUR for ETH on <Link to="/exchange">Augmint's exchange</Link>.
                    </StyledP>
                    <StyledP className={_className}>
                        Buy A-EUR for fiat EUR on <MrCoinBuyLink web3Connect={web3Connect}>MrCoin.eu</MrCoinBuyLink>,
                        our partner exchange.
                    </StyledP>
                </Tblock>

                <Tblock header="Earn A-EUR" headerStyle={"primaryColor"}>
                    <StyledP className={_className}>
                        <Link to="/lock">Lock your A-EUR</Link> for a premium
                    </StyledP>
                </Tblock>

                <Tblock header="Look around" headerStyle={"primaryColor"}>
                    <StyledP className={_className}>
                        See your loans, locks and A-EUR transfer history on your <Link to="/account">account page</Link>
                    </StyledP>
                    <StyledP className={_className}>
                        Check the <Link to="/stability">Stability dashboard</Link>
                    </StyledP>
                </Tblock>

                <Tsegment.Row columns={2}>
                    <Tsegment.Column>
                        <DiscordButton />
                    </Tsegment.Column>
                    <Tsegment.Column>
                        <TelegramButton />
                    </Tsegment.Column>
                </Tsegment.Row>
            </Tsegment>
        </EthereumState>
    );
}
