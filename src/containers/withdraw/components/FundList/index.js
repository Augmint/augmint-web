import React from "react";

import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { Button } from "components/augmint-ui/button";

import "./styles.css";
import { FUNDS } from "./funds.js";
import { ADDFUND } from "../AddWithdrawForm";

const FundItem = props => {
    const { fund, user, order, amount } = props;
    const { name, buyUrl, sellUrl, features, image } = fund;
    const url = order === ADDFUND ? `${buyUrl}${user.address}` : `${sellUrl}${user.address}`;

    return (
        <li className="fund-item">
            <Pgrid>
                <Pgrid.Row>
                    {image && (
                        <div className="img-wrapper">
                            <img src={image} />
                        </div>
                    )}
                    <Pgrid style={{ paddingTop: "25px" }}>
                        <h3>{name}</h3>
                        <ul className="fund-features">
                            {features.map(feat => (
                                <li>{feat}</li>
                            ))}
                        </ul>
                    </Pgrid>
                </Pgrid.Row>
                <Pgrid.Row>
                    <a className="goToFund" href={`${url}&amount=${amount}`} target="_blank">
                        Go to {name}
                    </a>
                </Pgrid.Row>
            </Pgrid>
        </li>
    );
};

export default function FundList(props) {
    const { user, amount, order } = props;
    console.log("amount", amount);
    return (
        <ul id="fundlist">
            {FUNDS.map(fund => (
                <FundItem fund={fund} user={user} order={order} amount={amount} />
            ))}
        </ul>
    );
}
