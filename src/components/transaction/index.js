import React from "react";
import styled from "styled-components";
import theme from "styles/theme";
import AccountAddress from "components/accountAddress";
import HashURL from "components/hash";
import { connect } from "react-redux";

export const TxDate = styled.span`
    font-size: 12px;
`;

export const TxTitle = styled.span`
    font-weight: bold;
`;

export const TxDetails = styled.span`
    font-size: 12px;
`;

export const TxPrice = styled.span`
    white-space: nowrap;
    &.minus {
        display: block;
        color: ${theme.colors.red};
    }
    &.plus {
        display: block;
        color: ${theme.colors.green};
    }
`;

class TxInfo extends React.Component {
    getAddressType(address) {
        const {
            loanManager,
            lockManager,
            exchangeManager,
            legacyLoanManagers,
            legacyLockManagers,
            legacyExchangeManagers
        } = this.props;
        const loanAddresses = [loanManager, ...legacyLoanManagers].map(manager => manager.address.toLowerCase());
        const lockAddresses = [lockManager, ...legacyLockManagers].map(manager => manager.address.toLowerCase());
        const exchangeAddresses = [exchangeManager, ...legacyExchangeManagers].map(manager =>
            manager.address.toLowerCase()
        );

        address = address.toLowerCase();

        if (loanAddresses.includes(address) || address === "0x".padEnd(42, "0")) {
            return "LOAN";
        }
        if (lockAddresses.includes(address)) {
            return "LOCK";
        }
        if (exchangeAddresses.includes(address)) {
            return "EXCHANGE";
        }

        return "TRANSFER";
    }

    getTitleText(tx) {
        const map = {
            FROM_LOAN: "New loan",
            TO_LOAN: "Loan repayment",
            FROM_LOCK: "Lock in release",
            TO_LOCK: "New lock in",
            FROM_EXCHANGE: "A-EUR buy order",
            TO_EXCHANGE: "A-EUR sell order",
            FROM_TRANSFER: "Incoming transfer",
            TO_TRANSFER: "Outgoing transfer"
        };
        const type = this.getAddressType(tx.direction > 0 ? tx.args.from : tx.args.to);
        return map[`${tx.direction > 0 ? "FROM" : "TO"}_${type}`];
    }

    render() {
        const { tx } = this.props;

        return (
            <div>
                <div>
                    <TxTitle>{this.getTitleText(tx)}</TxTitle>{" "}
                    <small>
                        <HashURL hash={tx.transactionHash} type={"tx/"} title={"» Details"} />
                    </small>
                </div>
                <TxDetails data-testid="txDetails">
                    <AccountAddress
                        address={tx.direction < 0 ? tx.args.to : tx.args.from}
                        title={tx.direction < 0 ? "To: " : "From: "}
                        shortAddress={true}
                        showCopyIcon={false}
                    />
                    <br />
                    {tx.args.narrative}
                </TxDetails>
            </div>
        );
    }
}

TxInfo = connect(state => ({
    loanManager: state.contracts.latest.loanManager,
    lockManager: state.contracts.latest.lockManager,
    exchangeManager: state.contracts.latest.exchange,
    legacyLoanManagers: state.legacyLoanManagers.contracts,
    legacyLockManagers: state.legacyLockers.contracts,
    legacyExchangeManagers: state.legacyExchanges.contracts
}))(TxInfo);

export { TxInfo };
