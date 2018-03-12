import React from "react";

import {
    StyleTitle,
    StyleTable,
    StyleThead,
    StyleTbody,
    StyleTd,
    StyleTh,
    StyleTr
} from './style';

export class CustomTable extends React.Component {
    render() {
        const { datakeys, unit, data, headerdata, title, extraClass } = this.props;

        return (
            <div className={extraClass}>
                {title && <StyleTitle>{title}</StyleTitle>}
                <StyleTable>
                    <StyleThead>
                      {headerdata &&
                        <StyleTr>
                          {datakeys.map( (key, i) => (
                              <StyleTh key={'th_' + i}>{headerdata[key]}</StyleTh>
                          ))}
                        </StyleTr>}
                    </StyleThead>
                    <StyleTbody>
                        {data && data.map((rowData, rowIndex) => (
                          <StyleTr key={'row_' + rowIndex}>
                          {datakeys.map((key, index) => (
                            <StyleTd key={'row_' + rowIndex + '_cell_' + index}>
                              {rowData[key] !== 0 ? rowData[key] : '-'}{rowData[key]? (' ' + unit[index]) : ''}</StyleTd>
                          ))}
                        </StyleTr>
                        ))}
                    </StyleTbody>
              </StyleTable>
            </div>
        );
    }
}
