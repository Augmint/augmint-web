import React from "react";

import { StyleTitle, StyleTable, StyleThead, StyleTbody, StyleTd, StyleTh, StyleTr } from "./style";
import Button from "components/augmint-ui/button";

const PAGING = 10;

export class CustomTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            initData: this.props.data,
            dataToShow: this.props.data.slice(0, PAGING)
        };
        this.addData = this.addData.bind(this);
    }

    addData() {
        const { dataToShow, initData } = this.state;
        const lastIndex = initData.indexOf(dataToShow[dataToShow.length - 1]);

        this.setState({
            dataToShow: initData.slice(0, lastIndex + PAGING)
        });
    }

    render() {
        const { datakeys, data, unit, headerdata, title, extraClass, testid, noItemsMessage } = this.props;
        const { dataToShow } = this.state;

        return (
            <div className={extraClass}>
                {title && <StyleTitle>{title}</StyleTitle>}
                {data && data.length === 0 && <p>{noItemsMessage || "No items"}</p>}
                <StyleTable data-testid={testid} data-test-historycount={data ? data.length : 0}>
                    {data && data.length > 0 && (
                        <StyleThead>
                            {headerdata && (
                                <StyleTr>
                                    {datakeys.map((key, i) => (
                                        <StyleTh key={"th_" + i}>{headerdata[key]}</StyleTh>
                                    ))}
                                </StyleTr>
                            )}
                        </StyleThead>
                    )}
                    <StyleTbody>
                        {data &&
                            dataToShow &&
                            dataToShow.map((rowData, rowIndex) => (
                                <StyleTr key={"row_" + rowIndex}>
                                    {datakeys.map((key, index) => (
                                        <StyleTd key={"row_" + rowIndex + "_cell_" + index}>
                                            {rowData[key]}
                                            {rowData[key] ? " " + unit[index] : ""}
                                        </StyleTd>
                                    ))}
                                </StyleTr>
                            ))}
                    </StyleTbody>
                </StyleTable>
                <Button
                    size="big"
                    className="ghost"
                    onClick={this.addData}
                    style={{ marginTop: "1rem", marginLeft: "1rem" }}
                >
                    show older
                </Button>
            </div>
        );
    }
}
