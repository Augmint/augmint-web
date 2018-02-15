import React from "react";

import { Link } from "react-router-dom";

export function Disclaimer(props) {
    return (
        <div style={{ margin: "auto" }}>
            <p>
                The tokens issued by Augmint contracts are not legal tender. Use them at your own risk...
                <br />
                <Link to="/disclaimer">
                 For more details click here.
              </Link>
            </p>
        </div>
    );
}
