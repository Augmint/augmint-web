import React from "react";

import { Tsegment } from "components/TextContent";
import { DiscordButton, TelegramButton } from "components/LinkButtons";
import Video from "components/augmint-ui/video";
import Header from "components/augmint-ui/header";

import { MobileView, DesktopView, StoreBadge } from "./styles";
import { StyledP } from "components/augmint-ui/paragraph/styles";

import appStoreSVG from "assets/images/App_Store_Badge.svg";
import googlePlayPNG from "assets/images/google-play-badge.png";

export function HowToConnect(props) {
    return (
        <div>
            <MobileView>
                <Tsegment>
                    <StyledP className={"primaryColor"} style={{ margin: "0 5px" }}>
                        To use A-EUR on mobile you need one of the following web3 capable browsers:
                    </StyledP>
                    <Tsegment.Row columns={2}>
                        <Tsegment.Column>
                            <StyledP className={"primaryColor dappBrowsernames"}>
                                <strong>Trust Wallet</strong>
                            </StyledP>
                            <a
                                href="https://links.trustwalletapp.com/levRYG1UMU"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <StoreBadge src={appStoreSVG} />
                            </a>
                            <a
                                href="https://links.trustwalletapp.com/levRYG1UMU"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <StoreBadge src={googlePlayPNG} />
                            </a>
                        </Tsegment.Column>
                        <Tsegment.Column>
                            <StyledP className={"primaryColor dappBrowsernames"}>
                                <strong>Coinsbase Wallet</strong>
                            </StyledP>
                            <a
                                href="https://itunes.apple.com/app/coinbase-wallet/id1278383455?ls=1&mt=8"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <StoreBadge src={appStoreSVG} />
                            </a>
                            <a
                                href="https://play.google.com/store/apps/details?id=org.toshi"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <StoreBadge src={googlePlayPNG} />
                            </a>
                        </Tsegment.Column>
                    </Tsegment.Row>
                    <Tsegment.Row columns={2}>
                        <Tsegment.Column>
                            <DiscordButton />
                        </Tsegment.Column>
                        <Tsegment.Column>
                            <TelegramButton />
                        </Tsegment.Column>
                    </Tsegment.Row>
                </Tsegment>
            </MobileView>
            <DesktopView>
                <Tsegment>
                    <Tsegment.Row columns={1}>
                        <Tsegment.Column>
                            <StyledP className={"primaryColor"}>
                                To use Augmint you need an Ethereum capable browser.
                            </StyledP>
                            <Header as="h4" className={"tertiaryColor"}>
                                1. Install{" "}
                                <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">
                                    <strong>MetaMask Chrome plugin</strong>
                                </a>
                            </Header>
                            <Header as="h4" className={"tertiaryColor"}>
                                2. Connect to Main or Rinkeby test network.
                            </Header>
                            <StyledP className={"primaryColor"}>
                                Video about installing MetaMask and getting test A-EUR:
                            </StyledP>
                            <Video
                                title="connect to rinkeby"
                                src="https://www.youtube.com/embed/0APcMesrZ_U"
                                host="https://www.youtube.com"
                            />
                        </Tsegment.Column>
                    </Tsegment.Row>
                    <Tsegment.Row columns={2}>
                        <Tsegment.Column>
                            <DiscordButton />
                        </Tsegment.Column>
                        <Tsegment.Column>
                            <TelegramButton />
                        </Tsegment.Column>
                    </Tsegment.Row>
                </Tsegment>
            </DesktopView>
        </div>
    );
}
