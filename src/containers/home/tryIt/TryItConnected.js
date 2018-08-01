import React from "react";
import { Tsegment, Tblock } from "components/TextContent";
import { Link } from "react-router-dom";
import { EthereumState } from "containers/app/EthereumState";
import { SuccessPanel } from "components/MsgPanels";
import { DiscordButton } from "components/LinkButtons";
import { StyledP } from "components/augmint-ui/paragraph/styles";
import Video from "components/augmint-ui/video";
import { MrCoinBuyLink } from "components/ExchangeLinks";

export function TryItConnected(props) {
    const { className, web3Connect } = props;
    let _className = className + " primaryColor";
    return (
        <EthereumState>
            <Tsegment style={{ padding: "2em 1em" }}>
                <SuccessPanel
                    data-testid="TryItConnectedPanel"
                    header={`Great! You are connected to ${web3Connect.network.name} network`}
                />

                {web3Connect.network.id === 4 && (
                    <Tblock header="Get some test ETH" headerStyle={"primaryColor"}>
                        <StyledP className={_className}>
                            Use{" "}
                            <a href="https://faucet.rinkeby.io/" target="_blank" rel="noopener noreferrer">
                                faucet.rinkeby.io
                            </a>
                        </StyledP>
                        <StyledP className={_className}>
                            If you can't be bothered ask for some{" "}
                            <a href="https://discord.gg/PwDmsnu" target="_blank" rel="noopener noreferrer">
                                on our discord channel
                            </a>
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

                <Tsegment.Row columns={1}>
                    <Tsegment.Column>
                        <DiscordButton />
                    </Tsegment.Column>
                </Tsegment.Row>
            </Tsegment>
        </EthereumState>
    );
}
