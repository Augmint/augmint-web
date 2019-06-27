import React from "react";
import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";
import { Pgrid, Pblock } from "components/PageLayout";
import { DECIMALS } from "utils/constants";
import { AEUR, ETH } from "components/augmint-ui/currencies";
import AccountAddress from "components/accountAddress";
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

const pick = (arr, key) => arr && arr.map(item => item[key]);
const sum = arr => arr && arr.reduce((acc, item) => acc + item, 0).toFixed(DECIMALS);

export default class Balance extends React.Component {
    render() {
        const { userAccount, loans, locks, children } = this.props;
        const activeLoans = loans.loans && loans.loans.filter(loan => loan.isRepayable);
        const activeLocks = locks.locks && locks.locks.filter(lock => lock.isReleasebale || lock.isActive);
        const loansAmount = sum(pick(activeLoans, "loanAmount"));
        const locksAmount = sum(pick(activeLocks, "amountLocked"));

        return (
            <Pblock
                className="balance"
                style={{ justifyContent: "center", maxWidth: "500px", margin: "auto", marginBottom: 0 }}
            >
                <div style={{ textAlign: "center" }}>
                    <Label className="balance">Current balance</Label>
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
                    {loans && loans.isLoaded && loans.loans.length > 0 ? (
                        <Pgrid.Column
                            size={1 / 2}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                textAlign: "-webkit-center",
                                padding: "1rem 0 0"
                            }}
                        >
                            {parseFloat(loansAmount) !== 0 ? (
                                <>
                                    <Label>My total loans</Label>
                                    <TokenAmount>
                                        <AEUR amount={loansAmount} />
                                    </TokenAmount>
                                    <Button className="naked" to="/loan" style={{ fontSize: ".875rem" }}>
                                        View all
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        style={{ width: "95%", boxSizing: "border-box", padding: "10px" }}
                                        to="/loan/new"
                                    >
                                        Get a new loan
                                    </Button>
                                    <Button className="naked" to="/loan/archive" style={{ fontSize: ".875rem" }}>
                                        View old loans
                                    </Button>
                                </>
                            )}
                        </Pgrid.Column>
                    ) : (
                        <Pgrid.Column
                            size={1 / 2}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                textAlign: "-webkit-center",
                                padding: "1rem 0 .5rem"
                            }}
                        >
                            <Button style={{ width: "95%", boxSizing: "border-box", padding: "10px" }} to="/loan/new">
                                Get a new loan
                            </Button>
                        </Pgrid.Column>
                    )}
                    {locks && locks.locks.length > 0 ? (
                        <Pgrid.Column
                            size={1 / 2}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                textAlign: "-webkit-center",
                                padding: "1rem 0 0"
                            }}
                        >
                            {parseFloat(locksAmount) !== 0 ? (
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
                                <>
                                    <Button
                                        style={{ width: "95%", boxSizing: "border-box", padding: "10px" }}
                                        to="/lock/new"
                                    >
                                        Lock A-EUR
                                    </Button>
                                    <Button className="naked" to="/lock/archive" style={{ fontSize: ".875rem" }}>
                                        View old locks
                                    </Button>
                                </>
                            )}
                        </Pgrid.Column>
                    ) : (
                        <Pgrid.Column
                            size={1 / 2}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                textAlign: "-webkit-center",
                                padding: "1rem 0 .5rem"
                            }}
                        >
                            <Button style={{ width: "95%", boxSizing: "border-box", padding: "10px" }} to="/lock/new">
                                Lock A-EUR
                            </Button>
                        </Pgrid.Column>
                    )}
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
