import React from "react";
// import { connect } from "react-redux";
// import { ConnectionStatus } from "components/MsgPanels";
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
                {/* <g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                        <path d="M3.5 3.5l26.618 26.618M30.5 3.5L3.882 30.118"/>
                    </g>
                </StyledSvg> */}
                {children}
            </StyledNotificationPanel>
        );
    }
}
