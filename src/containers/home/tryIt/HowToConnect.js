import React from "react";

import { Tsegment } from "components/TextContent";
import { Link } from "react-router-dom";
import { DiscordButton } from "components/LinkButtons";
import Video from "components/augmint-ui/video";

import { MobileView, DesktopView, StoreBadge } from "./styles";

import appStoreSVG from "assets/images/App_Store_Badge.svg";
import googlePlayPNG from "assets/images/google-play-badge.png";

export function HowToConnect(props) {
    return (
        <div>
            <MobileView>
                <Tsegment>
                    <Tsegment.Row columns={1}>
                        <Tsegment.Column>
                            <p>To use A-EUR on mobile you need a web3 capable browser such as Trust Wallet.</p>
                            <a
                                href="https://itunes.apple.com/us/app/trust-ethereum-wallet/id1288339409"
                                target="_blank"
                            >
                                <StoreBadge src={appStoreSVG} />
                            </a>
                            <a
                                href="https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp"
                                target="_blank"
                            >
                                <StoreBadge src={googlePlayPNG} />
                            </a>
                        </Tsegment.Column>
                    </Tsegment.Row>
                </Tsegment>
            </MobileView>
            <DesktopView>
                <Tsegment>
                    <Tsegment.Row columns={1}>
                        <Tsegment.Column>
                            <p>To use Augmint you need an Ethereum capable browser.</p>
                            <h4>
                                1. Install{" "}
                                <Link to="https://metamask.io/" target="_blank">
                                    <strong>MetaMask Chrome plugin</strong>
                                </Link>
                            </h4>
                            <h4>2. Connect to Rinkeby test network</h4>
                            <Video
                                title="connect to rinkeby"
                                src="https://www.youtube.com/embed/0APcMesrZ_U"
                                host="https://www.youtube.com"
                            />
                        </Tsegment.Column>
                    </Tsegment.Row>
                    <Tsegment.Row columns={1}>
                        <Tsegment.Column>
                            <DiscordButton />
                        </Tsegment.Column>
                    </Tsegment.Row>
                </Tsegment>
            </DesktopView>
        </div>
    );
}
