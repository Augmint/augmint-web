import React from "react";
import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";
import { Pgrid, Pblock } from "components/PageLayout";
import { DECIMALS } from "utils/constants";
import { AEUR, ETH } from "components/augmint-ui/currencies";
import AccountAddress from "components/accountAddress";

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
            <Pblock className="balance" style={{ marginTop: "1rem" }}>
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                    <Label className="balance">Current balance</Label>
                    <TokenBalance>
                        <AEUR amount={userAccount.tokenBalance} className="currency" />
                    </TokenBalance>
                </div>
                <Pgrid.Row style={{ textAlign: "center" }}>
                    <Pgrid.Column size={1 / 2} style={{ padding: "1rem 0" }}>
                        <Label>My total loans</Label>
                        <TokenAmount>
                            <AEUR amount={loansAmount} />
                        </TokenAmount>
                    </Pgrid.Column>
                    <Pgrid.Column size={1 / 2} style={{ padding: "1rem 0" }}>
                        <Label>My total locks</Label>
                        <TokenAmount>
                            <AEUR amount={locksAmount} />
                        </TokenAmount>
                    </Pgrid.Column>
                </Pgrid.Row>
                <EthAmount style={{ textAlign: "center" }}>
                    <Label>ETH balance</Label>
                    <ETH amount={userAccount.ethBalance} />
                </EthAmount>
                {children}
            </Pblock>
        );
    }
}
