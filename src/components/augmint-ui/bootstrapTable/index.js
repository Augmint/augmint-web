import React from "react";

import { Table, Tr, } from 'styled-table-component';
import { StyleTitle, StyleTable, StyleThead, StyleTbody, StyleTd, StyleTh, StyleTr } from "./styles";

export class BootstrapTable extends React.Component {
    render() {
        const { mockData, datakeys, unit, data, headerdata, extraClass, testid } = this.props;
        console.log(mockData);

        return (
            <div className={extraClass}>
                <Table striped>
                    <thead>
                        <Tr>
                            {Object.keys(mockData[0]).map((key, i) => <th key={"th_" + i} scope="col">{key}</th>)}
                        </Tr>
                    </thead>
                    <tbody>
                        {mockData.map((rowData, rowIndex) => (
                            <Tr key={"row_" + rowIndex}>
                                {Object.keys(rowData).map((key, i) => (
                                    <td key={"row_" + rowIndex + "_cell_" + i}>
                                        {rowData[key]}
                                    </td>
                                ))}
                            </Tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        );
    }
}

BootstrapTable.defaultProps = {mockData: [
        {
            to: "0xd83a566e710da5256cd293f00f94709cab519bf5252ad298197bf32a7f68e82e",
            from: "0x2f3ec022a7e947ee50b364ff052c07d5e816900e0e73224e04f7de8faab0ca93",
            dateTime: 1526488945,
            amount: 0.00012,
            description: "lorem"
        },
        {
            to: "0x85b3d743fbe4ec4e2b58947fa5484da7b2f5538b0ae8e655646f94c95d5fb949",
            from: "0x2f3ec022a7e947ee50b364ff052c07d5e816900e0e73224e04f7de8faab0ca93",
            dateTime: 1526483945,
            amount: 0.002,
            description: "ipsum"
        },
        {
            to: "0x34a4a813a9ed02ca86af9687935802fd664f4f67efc5680d7077da70e1d4e5fb",
            from: "0x8cf61dd5ce563454a0e79f621b591a324d725ef1e6887417e2adafad62a1a716",
            dateTime: 1526483935,
            amount: 0.0033,
            description: "dorem"
        },
        {
            to: "0x34a4a813a9ed02ca86af9687935802fd664f4f67efc5680d7077da70e1d4e5fb",
            from: "0x8cf61dd5ce563454a0e79f621b591a324d725ef1e6887417e2adafad62a1a716",
            dateTime: 1526483955,
            amount: 0.013,
            description: "sit"
        }
    ]
};
