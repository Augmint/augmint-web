import React from 'react';

import { Grid } from "semantic-ui-react";

import { StableIcon, DecentralizedIcon, SecureIcon } from '../../../components/Icons';

export const keyFeatures = [
    {
        image: <StableIcon/>,
        title: 'Stable',
        text: 'With tokens pegged to their respective fiat, Augmint has low volatility and offers the stability typical crypotcurrencies lack.',
    },
    {
        image: <DecentralizedIcon/>,
        title: 'Decentralised',
        text: 'Augmint operates in an open and transparent way, free from government, institutions, or banks.',
    },
    {
        image: <SecureIcon/>,
        title: 'Secure',
        text: 'Built on blockchain technology, Augmint uses Etherum smart contracts that offer sophisticated cryptographic security.',
    }
];  