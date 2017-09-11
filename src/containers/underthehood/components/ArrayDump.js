import React from "react";
import stringifier from "stringifier";
import { Pblock } from "components/PageLayout";
import {
    MyGridTable,
    MyGridTableRow as Row,
    MyGridTableColumn as Col
} from "components/MyListGroups";

const stringify = stringifier({ maxDepth: 3, indent: "   " });

export function ArrayDump(props) {
    const { items, header } = props;

    if (items === null) {
        return <p>null</p>;
    }
    if (items.length === 0) {
        return <p>empty array</p>;
    }

    const listItems = items.map((item, index) => (
        <Row key={index} columns={1}>
            <Col>
                <pre style={{ fontSize: "0.8em", overflow: "auto" }}>
                    [{index}] {stringify(item)}
                </pre>
            </Col>
        </Row>
    ));

    return (
        <Pblock header={header}>
            <MyGridTable>{listItems}</MyGridTable>
        </Pblock>
    );
}
