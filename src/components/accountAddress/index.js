import React from "react";
import Icon from "components/augmint-ui/icon";
import Button from "components/augmint-ui/button";

import { shortAccountAddresConverter } from "utils/converter";
import { StyledContainer, StyledClicked, StyledHint, StyledHintBtn } from "./styles";

export default class AccountAddress extends React.Component {
    constructor(props) {
        super(props);
        this.toggleHint = this.toggleHint.bind(this);
        this.copyAddress = this.copyAddress.bind(this);
        this.state = {
            showHint: false
        };
    }

    toggleHint(e, toggle, timeout) {
        if (toggle) {
            this.setState({ showHint: true });
            this.copyAddress();
            timeout &&
                setTimeout(() => {
                    this.setState({
                        showHint: false
                    });
                }, 2000);
        } else {
            this.setState({
                showHint: false
            });
        }
    }

    copyAddress(e) {
        const el = document.createElement("textarea");
        el.value = this.props.address;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
    }

    render() {
        const { address, showCopyIcon, title, shortAddress, className, showCopyLink } = this.props;
        const _title = title !== undefined ? title : "Account: ";
        const _className = this.state.showHint ? className + " showHint" : className;
        const ShortAddress = () => _title + (shortAddress === true ? shortAccountAddresConverter(address) : address);

        const ContainerWBtn = () => {
            return (
                <StyledContainer className={className + " container"}>
                    <ShortAddress />
                    {showCopyIcon && (
                        <Icon
                            name="copy"
                            style={{ paddingLeft: 5 }}
                            onClick={e => this.toggleHint(e, true)}
                            onMouseLeave={e => this.toggleHint(e, false)}
                        />
                    )}
                    {/* <Button
                        className="naked sansserif"
                        onClick={e => this.toggleHint(e, true, true)}
                        // onMouseLeave={this.toggleHint}
                        style={{ display: "block" }}
                        // id="addressBtn"
                    >
                        Copy
                    </Button> */}
                    <Button
                        content="Copy"
                        data-testid="loansToCollectButton"
                        onClick={e => this.toggleHint(e, true, true)}
                        icon="copy"
                        labelposition="left"
                        iconsize="small"
                        style={{ marginTop: "10px", marginBottom: "20px" }}
                        className="ghost naked icon left"
                    />
                    <Button
                        content="Copy"
                        data-testid="loansToCollectButton"
                        onClick={e => this.toggleHint(e, true, true)}
                        icon="copy"
                        labelposition="left"
                        style={{ marginBottom: "20px" }}
                        className="grey icon left"
                    />
                    <StyledHintBtn className={_className} id="StyledHinBtn">
                        <Icon name="check" style={{ marginRight: "5px", color: "green" }} />
                        Copied!
                    </StyledHintBtn>
                </StyledContainer>
            );
        };

        const ContainerWHint = () => {
            return (
                <StyledContainer
                    onClick={e => this.toggleHint(e, true)}
                    onMouseLeave={e => this.toggleHint(e, false)}
                    className={_className}
                    id="StyledContainer"
                >
                    <ShortAddress />
                    {showCopyIcon && (
                        <Icon
                            name="copy"
                            style={{ paddingLeft: 5 }}
                            onClick={e => this.toggleHint(e, true)}
                            onMouseLeave={e => this.toggleHint(e, false)}
                        />
                    )}
                    <StyledHint>
                        <StyledClicked>
                            <Icon name="check" />
                        </StyledClicked>
                    </StyledHint>
                </StyledContainer>
            );
        };

        return <div>{showCopyLink ? <ContainerWBtn /> : <ContainerWHint />}</div>;
    }
}
