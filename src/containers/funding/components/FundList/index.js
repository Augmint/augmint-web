import React from "react";

import { Pgrid } from "components/PageLayout";

import "./styles.css";
import { FUNDS } from "./funds.js";
import { ADDFUND } from "../AddWithdrawForm";

const FundItem = props => {
    const { fund, direction } = props;
    const { name, image } = fund;
    const features = direction === ADDFUND ? fund.addFeatures : fund.withdrawFeatures;
    return (
        <li className="fund-item">
            <Pgrid>
                <Pgrid.Row>
                    {image && (
                        <div className="img-wrapper">
                            <img alt="mr-coin" src={image} />
                        </div>
                    )}
                    <Pgrid style={{ paddingTop: "25px", width: "calc(100% - 70px)" }}>
                        <h3>{name}</h3>
                        <ul className="fund-features">
                            {features.map((feat, i) => (
                                <li key={i}>{feat}</li>
                            ))}
                        </ul>
                    </Pgrid>
                </Pgrid.Row>
            </Pgrid>
        </li>
    );
};

export default function FundList(props) {
    const { user, amount, direction } = props;

    return (
        <ul id="fundlist" style={{ marginTop: 0 }}>
            {FUNDS.map((fund, i) => (
                <FundItem key={i} fund={fund} user={user} direction={direction} amount={amount} />
            ))}
        </ul>
    );
}
