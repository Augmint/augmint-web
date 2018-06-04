import React from "react";

import { StyledRail } from "./styles";

export default function Rail(props) {
    const { children, ...other } = props;
    return <StyledRail {...other}>{children}</StyledRail>;
}
