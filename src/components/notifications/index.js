import React from "react";
import store from "modules/store";
import { dismissTx } from "modules/reducers/submittedTransactions";
import { StyledNotificationPanel, StyledHead, StyledWrapper, StyledSpan, CloseIcon } from "./styles";
import close from "assets/images/close.svg";

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
                <StyledHead className={this.props.showNotificationPanel ? "opened" : ""}>
                    <StyledSpan className={this.props.showNotificationPanel ? "opened" : ""}>Notifications</StyledSpan>
                    <CloseIcon
                        src={close}
                        onClick={e => {
                            this.toggleNotificationPanel();
                            this.handleClose();
                        }}
                        className={this.props.showNotificationPanel ? "opened" : ""}
                    />
                </StyledHead>
                <StyledWrapper className={this.props.showNotificationPanel ? "opened" : ""}>{children}</StyledWrapper>
            </StyledNotificationPanel>
        );
    }
}
