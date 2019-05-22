import React from "react";

import { StableIcon, DecentralizedIcon, SecureIcon } from "components/Icons";

export const keyFeatures = [
    {
        image: <StableIcon />,
        title: "Stable",
        text:
            "With tokens targeted to their respective fiat, Augmint has low volatility and offers the stability cryptocurrencies typically lack."
    },
    {
        image: <DecentralizedIcon />,
        title: "Decentralised",
        text: "Augmint operates in an open and transparent way, free from government, institutions, or banks."
    },
    {
        image: <SecureIcon />,
        title: "Secure",
        text:
            "Built on blockchain technology, Augmint uses Ethereum smart contracts that offer sophisticated cryptographic security."
    }
];
