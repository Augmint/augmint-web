import React from "react";

const FundItem = props => {
    const { name, features, image } = props;
    return (
        <li>
            {image && <img src={image} />}
            <h2>{name}</h2>
            <ul>
                {features.map(feat => (
                    <li>{feat}</li>
                ))}
            </ul>
        </li>
    );
};

export default function FundList(props) {
    const { funds } = props;
    return (
        <ul>
            {funds.map(fund => (
                <FundItem name={fund.name} features={fund.features} image={fund.image} />
            ))}
        </ul>
    );
}
