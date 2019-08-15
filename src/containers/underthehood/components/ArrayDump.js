import React from "react";
import stringifier from "stringifier";
import * as strf from "stringifier/strategies";
import { Pblock } from "components/PageLayout";
import { MyGridTable, MyGridTableRow as Row, MyGridTableColumn as Col } from "components/MyListGroups";

const unitsHandler = (typeName, label = "", digits = 2) =>
    strf.flow.compose(
        next => {
            return (acc, x) => {
                acc.push(typeName);
                acc.push("[");
                acc.push(x.toString());
                acc.push(" = ");
                acc.push(x.toNumber().toFixed(digits));
                acc.push(label);
                acc.push("]");
                return next(acc, x);
            };
        },
        strf.flow.end()
    );

const stringifierConfig = {
    maxDepth: 3,
    indent: "    ",
    handlers: {
        Ratio: unitsHandler("Ratio"),
        Tokens: unitsHandler("Tokens", " AEUR"),
        Wei: unitsHandler("Wei", " ETH", 6)
    }
};

const stringify = stringifier(stringifierConfig);

export function ArrayDump(props) {
    const { items, header } = props;

    if (!items) {
        return <p>null</p>;
    }
    if (items.length === undefined) {
        return <p>not an array</p>;
    }

    const listItems =
        items.length === 0
            ? "empty array"
            : items.map((item, index) => (
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
