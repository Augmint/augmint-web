import React from "react";
import { Tsegment, Tblock } from "components/TextContent";
import { Link } from "react-router-dom";
import { EthereumState } from "containers/app/EthereumState";
import { SuccessPanel } from "components/MsgPanels";
import { DiscordButton } from "components/LinkButtons";
import { FeatureContext } from "modules/services/featureService";
import { StyledP } from "./styles";

export function TryItConnected(props) {
    return (
        <FeatureContext>
            {features => {
                const dashboard = features.dashboard;
                return (
                    <EthereumState>
                        <Tsegment>
                            <SuccessPanel data-testid="TryItConnectedPanel" header="Great! You are connected" />

                            <Tblock header="Get some test ETH" headerStyle ={ dashboard ? "primaryColor" : "" }>
                                <StyledP className={ dashboard ? "primaryColor" : "" }>
                                    Use{" "}
                                    <Link target="_blank" to="https://faucet.rinkeby.io/">
                                        faucet.rinkeby.io
                                    </Link>
                                </StyledP>
                                <StyledP className={ dashboard ? "primaryColor" : "" }>
                                    If you can't be bothered ask for some{" "}
                                    <Link target="_blank" to="https://discord.gg/PwDmsnu">
                                        on our discord channel
                                    </Link>
                                </StyledP>
                            </Tblock>

                            <Tblock header="Get A-EUR" headerStyle ={ dashboard ? "primaryColor" : "" }>
                                <StyledP className={ dashboard ? "primaryColor" : "" }>
                                    <Link to="/loan/new">Get a loan</Link> by leaving your ETH in escrow
                                </StyledP>
                                <StyledP className={ dashboard ? "primaryColor" : "" }>
                                    Buy A-EUR on <Link to="/exchange">Augmint's exchange</Link>
                                </StyledP>
                            </Tblock>

                            <Tblock header="Play around" headerStyle ={ dashboard ? "primaryColor" : "" }>
                                <StyledP className={ dashboard ? "primaryColor" : "" }>
                                    See your loans, transactions and transfer A-EUR from your <Link to="/account">account</Link>
                                </StyledP>
                                <StyledP className={ dashboard ? "primaryColor" : "" }>
                                    Check the <Link to="/reserves">Augmint reserves</Link>
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
            }}
        </FeatureContext>
    );
}
