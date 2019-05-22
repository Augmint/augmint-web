import React from "react";
import { InterchangeIcon } from "components/Icons";

function Convertible(props) {
    const { from, to, simple } = props;

    const containerStyles = {
        display: "flex",
        flexDirection: "row",
        color: "white",
        fontSize: 14
    };

    return (
        <div className="convertible" style={{ ...containerStyles, ...props.style }}>
            <div>
                {!simple && <div>1</div>}
                <div>{from}</div>
            </div>
            <InterchangeIcon />
            <div>
                {!simple && <div>1</div>}
                <div>{to}</div>
            </div>
        </div>
    );
}

export default Convertible;
