import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ConnectionStatus } from "components/MsgPanels";
import AccountAddress from "components/accountAddress";
import { StyledAccountInfo, StyledAccountDiv, StyledAccInfoLink } from "./styles";
import { AEUR, ETH } from "components/augmint-ui/currencies";
import { ETHEUR } from "utils/constants";
import Icon from "components/augmint-ui/icon";
import Button from "components/augmint-ui/button";
import WatchAssetButton from "components/watchAssetButton";
import { default as theme } from "styles/theme";

export class AccountInfo extends React.Component {
    render() {
        const {
            header,
            showMyAccountLink,
            data,
            augmintToken,
            userBalancesIsLoading,
            hideTestId,
            className,
            toggleAccInfo
        } = this.props;

        return (
            <StyledAccountInfo
                data-testid={!hideTestId && "accountInfoBlock"}
                className={className + " accountInfo"}
                loading={
                    augmintToken.isLoading ||
                    (!augmintToken.isLoaded && !augmintToken.loadError) ||
                    userBalancesIsLoading
                }
                header={header}
            >
                <ConnectionStatus contract={augmintToken} />
                <StyledAccountDiv>
                    <span style={{ fontWeight: "normal" }}>Account address:</span>
                    <div
                        style={{
                            margin: "0px",
                            fontFamily: theme.typography.fontFamilies.currency,
                            overflowWrap: "break-word"
                        }}
                    >
                        <AccountAddress
                            address={data.account.address}
                            showCopyIcon="true"
                            title=""
                            breakToLines={window.innerWidth < 768 ? true : false}
                        />
                    </div>
                </StyledAccountDiv>
                <br />
                <StyledAccountDiv>
                    <span style={{ fontWeight: "normal" }}>Balance:</span>
                    <div>
                        <AEUR
                            amount={data.account.tokenBalance}
                            data-testid={!hideTestId && "userAEurBalance"}
                            style={{ fontFamily: theme.typography.fontFamilies.currency }}
                        />
                    </div>
                    <div>
                        <ETH
                            amount={data.account.ethBalance}
                            data-testid={!hideTestId && "userEthBalance"}
                            decimals={15}
                            style={{ fontFamily: theme.typography.fontFamilies.currency }}
                        />
                    </div>
                </StyledAccountDiv>
                <StyledAccountDiv className="accInfoDetail">
                    <span style={{ fontWeight: "normal" }}>{ETHEUR}: </span>
                    <span style={{ fontFamily: theme.typography.fontFamilies.currency, fontWeight: "700" }}>
                        {data.rates.info.ethFiatRate}
                    </span>
                </StyledAccountDiv>
                {/* <Button
                    content={data.web3Connect.network.name}
                    to="/under-the-hood"
                    onClick={() => toggleAccInfo(null, null, true)}
                    icon="connect"
                    labelposition="left"
                    size="large"
                /> */}
                <StyledAccInfoLink
                    title="Under the hood"
                    to="/under-the-hood"
                    onClick={() => toggleAccInfo(null, null, true)}
                >
                    <Icon name="connect" />
                    {data.web3Connect.network.name}
                </StyledAccInfoLink>

                <WatchAssetButton className={"accInfo"} />

                {showMyAccountLink && <Link to="/account">More details</Link>}
            </StyledAccountInfo>
        );
    }
}

AccountInfo.defaultProps = {
    header: "My Account",
    showMyAccountLink: false
};

const mapStateToProps = state => ({
    userBalancesIsLoading: state.userBalances.isLoading,
    augmintToken: state.augmintToken
});

export default connect(mapStateToProps)(AccountInfo);
