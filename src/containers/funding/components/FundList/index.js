import React from "react";

import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import Button from "components/augmint-ui/button";

import "./styles.css";
import { FUNDS } from "./funds.js";
import { ADDFUND } from "../AddWithdrawForm";

const FundItem = props => {
    const { fund, user, direction, amount } = props;
    const { name, buyUrl, sellUrl, image } = fund;
    const url = direction === ADDFUND ? `${buyUrl}${user.address}` : `${sellUrl}${user.address}`;
    const features = direction === ADDFUND ? fund.addFeatures : fund.withdrawFeatures;
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
                    <Button
                        content={`Go to ${name}`}
                        href={`${url}&amount=${amount}`}
                        target="_blank"
                        labelposition="center"
                        size="large"
                        className="primary"
                        style={{ width: "100%", padding: "15px 20px" }}
                    />
                </Pgrid.Row>
            </Pgrid>
        </li>
    );
};

export default function FundList(props) {
    const { user, amount, direction } = props;

    return (
        <ul id="fundlist">
            {FUNDS.map(fund => (
                <FundItem fund={fund} user={user} direction={direction} amount={amount} />
            ))}
        </ul>
    );
}
