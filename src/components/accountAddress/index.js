import React from "react";
import Icon from "components/augmint-ui/icon";
import Button from "components/augmint-ui/button";

import { shortAccountAddresConverter } from "utils/converter";
import { StyledContainer, StyledClicked, StyledHint, StyledHintBtn } from "./styles";

export default class AccountAddress extends React.Component {
    constructor(props) {
        super(props);
        this.copyAddress = this.copyAddress.bind(this);
        this.removeClicked = this.removeClicked.bind(this);
    }

    copyAddress(e) {
        let element = e.target;
        let elHint;

        if (element.id === "addressBtn") {
            elHint = document.querySelector("#StyledHinBtn");
            elHint.classList.add("show");
        }

        if (element.id === "StyledContainer") {
            element = document.querySelector("#StyledContainer");
            element.classList.add("clicked");
        }

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

    removeClicked(e) {
        let element = document.querySelector("#StyledContainer");
        let elHint;
        if (document.querySelector("#StyledHinBtn")) {
            elHint = document.querySelector("#StyledHinBtn");
            setTimeout(() => {
                elHint.classList.remove("show");
            }, 3000);
        }
        element.classList.remove("clicked");
    }

    render() {
        const { address, showCopyIcon, title, shortAddress, className, showCopyLink } = this.props;
        const _title = title !== undefined ? title : "Account: ";
        const _className = className + " container";
        const ShortAddress = () => _title + (shortAddress === true ? shortAccountAddresConverter(address) : address);

        const ContainerWBtn = () => {
            return (
                <StyledContainer className={_className}>
                    <ShortAddress />
                    {showCopyIcon && (
                        <Icon
                            name="copy"
                            style={{ paddingLeft: 5 }}
                            onClick={this.copyAddress}
                            onMouseLeave={this.removeClicked}
                        />
                    )}
                    <Button
                        className="naked sanserif"
                        onClick={this.copyAddress}
                        onMouseLeave={this.removeClicked}
                        style={{ display: "block" }}
                        id="addressBtn"
                    >
                        Copy
                    </Button>
                    <StyledHintBtn className={""} id="StyledHinBtn">
                        <Icon name="check" style={{ marginRight: "5px", color: "green" }} />
                        Copied!
                    </StyledHintBtn>
                </StyledContainer>
            );
        };

        const ContainerWHint = () => {
            return (
                <StyledContainer
                    onClick={this.copyAddress}
                    onMouseLeave={this.removeClicked}
                    className={className}
                    id="StyledContainer"
                >
                    <ShortAddress />
                    {showCopyIcon && (
                        <Icon
                            name="copy"
                            style={{ paddingLeft: 5 }}
                            onClick={this.copyAddress}
                            onMouseLeave={this.removeClicked}
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

// export default function AccountAddress(props) {
//     const { address, showCopyIcon, title, shortAddress, className, showCopyLink } = props;
//     const _title = title !== undefined ? title : "Account: ";
//     const _className = className + " container";

//     function copyAddress(e) {
//         let element = e.target;
//         let siblingElem;
//         if (element.attributes.name && element.attributes.name.nodeValue === "copy") {
//             element = element.parentElement;
//         }
//         if (e.target.nextSibling) {
//             siblingElem = e.target.nextSibling;
//             siblingElem.classList.add("show");
//         }
//         element.classList.add("clicked");
//         const el = document.createElement("textarea");
//         el.value = address;
//         el.setAttribute("readonly", "");
//         el.style.position = "absolute";
//         el.style.left = "-9999px";
//         document.body.appendChild(el);
//         el.select();
//         document.execCommand("copy");
//         document.body.removeChild(el);
//     }

//     function removeClicked(e) {
//         let element = e.target;
//         let siblingElem;
//         if (element.attributes.name && element.attributes.name.nodeValue === "copy") {
//             element = element.parentElement;
//         }
//         if (e.target.nextSibling) {
//             siblingElem = e.target.nextSibling;
//             setTimeout(() => {
//                 siblingElem.classList.remove("show");
//             }, 3000);
//         }
//         element.classList.remove("clicked");
//     }

//     return (
//         <div>
//             {showCopyLink ? (
//                 <StyledContainer className={_className}>
//                     {_title + (shortAddress === true ? shortAccountAddresConverter(address) : address)}
//                     {showCopyIcon && (
//                         <Icon
//                             name="copy"
//                             style={{ paddingLeft: 5 }}
//                             onClick={copyAddress}
//                             onMouseLeave={removeClicked}
//                         />
//                     )}
//                     <Button
//                         className="naked sanserif"
//                         onClick={copyAddress}
//                         onMouseLeave={removeClicked}
//                         style={{ display: "block" }}
//                     >
//                         Copy
//                     </Button>
//                     <StyledDiv className={""}>
//                         <Icon name="check" style={{ marginRight: "5px", color: "green" }} />
//                         Copied!
//                     </StyledDiv>
//                 </StyledContainer>
//             ) : (
//                 <StyledContainer onClick={copyAddress} onMouseLeave={removeClicked} className={className}>
//                     {_title + (shortAddress === true ? shortAccountAddresConverter(address) : address)}
//                     {showCopyIcon && (
//                         <Icon
//                             name="copy"
//                             style={{ paddingLeft: 5 }}
//                             onClick={copyAddress}
//                             onMouseLeave={removeClicked}
//                         />
//                     )}
//                     <StyledHint>
//                         <StyledClicked>
//                             <Icon name="check" />
//                         </StyledClicked>
//                     </StyledHint>
//                 </StyledContainer>
//             )}
//         </div>
//     );
// }
