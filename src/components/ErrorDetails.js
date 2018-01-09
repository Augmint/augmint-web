import React from "react";
/* TODO: make \n -s in error msgs to break when placed in <pre> */
//import stringifier from "stringifier";

// export function stringifyError (err, filter, space) {
//     var plainObject = {};
//     Object.getOwnPropertyNames(err).forEach(function(key) {
//         plainObject[key] = err[key];
//     });
//     return JSON.stringify(plainObject, filter, space);
// };

// const stringify = stringifier({
//     maxDepth: 3,
//     indent: "   ",
//     lineSeparator: "<br/>"
// });

export default function ErrorDetails(props) {
    const { header = "Error details:", style = { fontSize: "0.8em", overflow: "auto" } } = props;
    return (
        <div>
            <p>{header}</p>
            <pre style={style}>{props.children}</pre>
        </div>
    );
}
