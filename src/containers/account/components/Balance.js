import React from "react";
import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";
import { Pgrid, Pblock } from "components/PageLayout";
import { DECIMALS } from "utils/constants";

const Label = styled.div`
    font-size: ${remCalc(14)};
    color: ${theme.colors.mediumGrey};
    &.balance {
        text-align: left;
    }
`;

const TokenBalance = styled.div`
    font-family: ${theme.typography.fontFamilies.currency};
    font-size: ${remCalc(48)};
    .currency {
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
        const { userAccount, loans, locks } = this.props;
        const activeLoans = loans.loans && loans.loans.filter(loan => loan.isRepayable);
        const activeLocks = locks.locks && locks.locks.filter(lock => lock.isReleasebale || lock.isActive);
        const loansAmount = sum(pick(activeLoans, "loanAmount"));
        const locksAmount = sum(pick(activeLocks, "amountLocked"));

        return (
            <Pblock style={{ textAlign: "center" }}>
                <div>
                    <Label className="balance">Current balance</Label>
                    <TokenBalance>
                        {userAccount.tokenBalance}
                        <span className="currency"> A€</span>
                    </TokenBalance>
                </div>
                <Pgrid.Row>
                    <Pgrid.Column size={1 / 2}>
                        <Label>My total loans</Label>
                        <TokenAmount>
                            {loansAmount} <span className="currency">A€</span>
                        </TokenAmount>
                    </Pgrid.Column>
                    <Pgrid.Column size={1 / 2}>
                        <Label>My total locks</Label>
                        <TokenAmount>
                            {locksAmount} <span className="currency">A€</span>
                        </TokenAmount>
                    </Pgrid.Column>
                </Pgrid.Row>
                <EthAmount>
                    <Label>ETH balance</Label>
                    <div>{userAccount.ethBalance} ETH</div>
                </EthAmount>
            </Pblock>
        );
    }
}
