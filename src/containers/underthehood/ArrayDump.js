import React from "react";
import { Table } from "react-bootstrap";
import stringifier from "stringifier";

const stringify = stringifier({ maxDepth: 3, indent: "   " });

export function ArrayDump(props) {
    const items = props.items;

    if (items === null) {
        return <p>null</p>;
    }
    if (items.length === 0) {
        return <p>empty array</p>;
    }

    const listItems = items.map((item, index) =>
        <tr key={index}>
            <td>
                <pre style={{ fontSize: 10 + "px" }}>
                    [{index}] {stringify(item)}
                </pre>
            </td>
        </tr>
    );

    return (
        <Table condensed striped>
            <tbody>
                {listItems}
            </tbody>
        </Table>
    );
}
