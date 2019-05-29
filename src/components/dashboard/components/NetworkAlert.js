import React from "react";
import styled from "styled-components";
import { media } from "styles/media";

const StyledDiv = styled.div`
    &.banner {
        position: fixed;
        z-index: 103;
        left: 50%;
        transform: translate(-50%);
        margin-top: 15px;
        padding: 5px 10px;
        background: rgba(159, 58, 56, 1);
        border-radius: 2px;
        font-size: 0.8rem;
        text-align: center;

        ${media.desktopMin`
            margin-left: 105px;
        `}
    }
`;

export default function NetworkAlert(props) {
    return <StyledDiv className={props.className}>Connected to {props.network.toUpperCase()}</StyledDiv>;
}
