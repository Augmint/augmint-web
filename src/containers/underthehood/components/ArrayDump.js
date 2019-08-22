import React from "react";
import stringifier from "stringifier";
import * as strf from "stringifier/strategies";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Button from "components/augmint-ui/button";
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

const jsonifierConfig = {
    indent: "  ",
    handlers: {
        Ratio: strf.toStr(),
        Tokens: strf.toStr(),
        Wei: strf.toStr(),
        LoanProduct: strf.json(),
        Loan: strf.json()
    }
};

export const stringify = stringifier(stringifierConfig);
export const jsonify = stringifier(jsonifierConfig);

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
                          <pre style={{ fontSize: "0.8em" }}>
                              [{index}] {stringify(item)}
                          </pre>
                      </Col>
                  </Row>
              ));

    return (
        <Pblock header={header} headerStyle={{ fontSize: "1.2em", fontWeight: "normal" }}>
            <CopyToClipboard text={jsonify(items)} onCopy={() => alert("JSON data copied to clipboard")}>
                <Button size="small">Copy {items.length} items to clipboard</Button>
            </CopyToClipboard>

            <MyGridTable>{listItems}</MyGridTable>
        </Pblock>
    );
}
