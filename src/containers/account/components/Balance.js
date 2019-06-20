import React from "react";
import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";
import { Pgrid, Pblock } from "components/PageLayout";
import { DECIMALS } from "utils/constants";
import { AEUR, ETH } from "components/augmint-ui/currencies";
import AccountAddress from "components/accountAddress";
import WatchAssetButton from "components/watchAssetButton";
import Button from "components/augmint-ui/button";
import ButtonGroup from "components/augmint-ui/buttonGroup";

const Label = styled.div`
    font-size: ${remCalc(14)};
    color: ${theme.colors.mediumGrey};
    &.balance {
        text-align: center;
    }
`;

const TokenBalance = styled.div`
    font-family: ${theme.typography.fontFamilies.currency};
    font-size: ${remCalc(48)};
    .currency > span {
        font-size: ${remCalc(24)};
    }
`;

const TokenAmount = styled.div`
    font-family: ${theme.typography.fontFamilies.currency};
    font-size: ${remCalc(24)};
`;

const EthAmount = styled.div`
    margin-top: 0.5em;
    padding: 0.5em 0;
    border-top: 1px solid ${theme.colors.grey};
    font-family: ${theme.typography.fontFamilies.currency};
`;

const Container = styled.div`
    width: 100%;
    text-align: center;
    display: flex;
    justify-content: space-between;
`;

const pick = (arr, key) => arr && arr.map(item => item[key]);
const sum = arr => arr && arr.reduce((acc, item) => acc + item, 0).toFixed(DECIMALS);

export default class Balance extends React.Component {
    render() {
        const { userAccount, loans, locks, children } = this.props;
        const activeLoans = loans.loans && loans.loans.filter(loan => loan.isRepayable);
        const activeLocks = locks.locks && locks.locks.filter(lock => lock.isReleasebale || lock.isActive);
        const loansAmount = sum(pick(activeLoans, "loanAmount"));
        const locksAmount = sum(pick(activeLocks, "amountLocked"));

        console.log("locks: ", locks);
        console.log("loans: ", loans);

        return (
            <Pblock className="balance" style={{ marginBottom: 0 }}>
                <div style={{ textAlign: "center" }}>
                    <Label className="balance">Current balance</Label>
                    {/* <TokenBalance style={{ textAlign: "justify"}}> */}
                    <TokenBalance style={{ fontSize: "2rem" }}>
                        {/* <AEUR 
                            amount={userAccount.tokenBalance} 
                            className="currency" 
                            style={{ display: "inline-block", position: "relative", transform: "translate(-50%)", left: "50%"}}
                        /> */}
                        <AEUR amount={userAccount.tokenBalance} className="currency" />
                    </TokenBalance>
                </div>
                <ButtonGroup />
                <Pgrid.Row style={{ textAlign: "center" }}>
                    <Pgrid.Column size={1 / 2} style={{ padding: "1rem 0 0" }}>
                        {loans && loans.isLoaded && loans.loans.length > 0 ? (
                            <>
                                <Label>My total loans</Label>
                                <TokenAmount>
                                    <AEUR amount={loansAmount} />
                                </TokenAmount>
                                <Button className="naked" to="/loan">
                                    View all
                                </Button>
                            </>
                        ) : (
                            <Button style={{ width: "100%", margin: "0 4px", padding: "10px" }} to="/loan/new">
                                Get a new loan
                            </Button>
                        )}
                    </Pgrid.Column>
                    <Pgrid.Column size={1 / 2} style={{ padding: "1rem 0 0", display: "flex" }}>
                        {locks && locks.locks.length > 0 ? (
                            <>
                                <Label>My total locks</Label>
                                <TokenAmount>
                                    <AEUR amount={locksAmount} />
                                </TokenAmount>
                                <Button className="naked" to="/lock" style={{ fontSize: ".875rem" }}>
                                    View all
                                </Button>
                            </>
                        ) : (
                            <Button style={{ width: "95%", margin: "0 4px", padding: "10px" }} to="/lock/new">
                                Lock A-EUR
                            </Button>
                        )}
                    </Pgrid.Column>
                </Pgrid.Row>
                <EthAmount style={{ textAlign: "center" }}>
                    <Label>ETH balance</Label>
                    <ETH amount={userAccount.ethBalance} />
                </EthAmount>
                <div
                    style={{
                        textAlign: "center",
                        margin: ".5rem auto 0",
                        overflowWrap: "break-word"
                    }}
                >
                    <Label className="balance">Account address</Label>
                    <AccountAddress
                        address={userAccount.address}
                        title=""
                        className={"breakToLines always noClick font"}
                        showCopyLink
                    />
                </div>
                {children}
            </Pblock>
        );
    }
}
