import React from "react";
import { InterchangeIcon } from "components/Icons";

function Convertible(props) {
    const { from, to, simple, center, left, right } = props;

    let justify = "center";
    if (center || left || right) {
        justify = center || left || right;
    }

    const containerStyles = {
        display: "flex",
        flexDirection: "row",
        justifyContent: justify,
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
