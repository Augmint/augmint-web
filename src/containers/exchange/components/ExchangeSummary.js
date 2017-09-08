import React from "react";
import { Pblock } from "components/PageLayout";
import { NoOrdersToolTip } from "./ExchangeToolTips";

export default class ExchangeSummary extends React.Component {
    render() {
        const { rates, exchangeInfo, ...other } = this.props;
        const { totalAmount, totalCcy, orderCount } = exchangeInfo;

        return (
            <Pblock {...other}>
                <h4>
                    1 ETH = {rates.info.ethUsdRate} UCD<br />
                    1 UCD = {rates.info.usdEthRate} ETH
                </h4>

                {orderCount > 0 && (
                    <h4>
                        Total open sell orders: {totalAmount} {totalCcy}
                        {orderCount > 0 && (
                            <small>
                                {" ( "}
                                {orderCount} orders )
                            </small>
                        )}
                    </h4>
                )}

                {orderCount === 0 && (
                    <h4>
                        No open orders. Place one. <NoOrdersToolTip />
                    </h4>
                )}
            </Pblock>
        );
    }
}

ExchangeSummary.defaultProps = {
    header: "Exchange summary"
};
