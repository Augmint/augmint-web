import React from "react";
import store from "modules/store";
import { dismissTx } from "modules/reducers/submittedTransactions";
import { StyledNotificationPanel, StyledSpan, CloseIcon } from "./styles";
import closeBlack from "assets/images/close-black.svg";

export class NotificationPanel extends React.Component {
    constructor(props) {
        super(props);
        this.handleClose = this.handleClose.bind(this);
        this.toggleNotificationPanel = this.toggleNotificationPanel.bind(this);
    }

    handleClose(txHash) {
        store.dispatch(dismissTx(txHash));
    }

    toggleNotificationPanel() {
        this.props.toggleNotificationPanel();
    }

    render() {
        const { className, children } = this.props;
        return (
            <StyledNotificationPanel className={className}>
                <StyledSpan className={this.props.showNotificationPanel ? "opened" : ""}>Notifications</StyledSpan>
                <CloseIcon
                    src={closeBlack}
                    onClick={e => {
                        this.toggleNotificationPanel();
                        this.handleClose();
                    }}
                    className={this.props.showNotificationPanel ? "opened" : ""}
                />
                {children}
            </StyledNotificationPanel>
        );
    }
}
