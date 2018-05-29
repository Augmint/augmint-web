import React from "react";

import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import { CustomTable } from "components/Table";

export default class BootstrapTableCustom extends React.Component {
    render() {
        const { header } = this.props;
        const { trades, error, isLoading } = this.props.trades;
        const dataKeys = [
            "to",
            "from",
            "dateTime",
            "amount",
            "description"
        ];
        const headerData = {
            to: "To",
            from: "From",
            dateTime: "Date & Time",
            amount: "Amount",
            description: "Description"
        };

        return (
            <Pblock loading={isLoading} header={header}>
                {error && <ErrorPanel header="Error while fetching trade list">{error.message}</ErrorPanel>}
                {trades == null && !isLoading && <p>Connecting...</p>}
                {!error && isLoading ? (
                    <p data-testid="BootstrapTableCustomRefreshing">Refreshing orders...</p>
                ) : (
                    <CustomTable
                        datakeys={dataKeys}
                        data={trades}
                        headerdata={headerData}
                        testid="transaction-history"
                    />
                )}
            </Pblock>
        );
    }
}
