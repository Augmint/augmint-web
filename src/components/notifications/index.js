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
        store.dispatch(dismissTx(txHash, "dismiss"));
    }

    toggleNotificationPanel() {
        this.props.toggleNotificationPanel();
    }

    render() {
        const { className, id, children } = this.props;
        const _className = this.props.showNotificationPanel ? "open" : "";
        return (
            <StyledNotificationPanel className={className} id={id}>
                <StyledHead className={_className}>
                    <StyledSpan>Notifications</StyledSpan>
                    <CloseIcon
                        src={close}
                        onClick={e => {
                            this.toggleNotificationPanel();
                            this.handleClose();
                        }}
                    />
                </StyledHead>
                <StyledWrapper className={_className}>{children}</StyledWrapper>
            </StyledNotificationPanel>
        );
    }
}
