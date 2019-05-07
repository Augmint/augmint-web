import React from "react";

import { StyleTitle, StyleTable, StyleThead, StyleTbody, StyleTd, StyleTh, StyleTr } from "./style";
import Button from "components/augmint-ui/button";

const PAGING = 10;

export class CustomTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            initData: this.props.data,
            dataToShow: this.props.data.slice(0, PAGING),
            buttonVisible: true
        };
        this.addData = this.addData.bind(this);
    }

    addData() {
        this.setState({
            dataToShow: this.state.initData,
            buttonVisible: false
        });
    }

    render() {
        const { datakeys, data, unit, headerdata, title, extraClass, testid, noItemsMessage } = this.props;
        const { dataToShow, buttonVisible } = this.state;

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
                {buttonVisible && (
                    <Button
                        size="big"
                        className="ghost"
                        onClick={this.addData}
                        style={{ marginTop: "1rem", marginLeft: "1rem" }}
                    >
                        Show older
                    </Button>
                )}
            </div>
        );
    }
}
