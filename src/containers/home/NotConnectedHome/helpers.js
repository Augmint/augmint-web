import React from 'react';

import { 
    StableIcon,
    DecentralizedIcon,
    SecureIcon,
    DepositIcon,
    SpendIcon,
    GetDepositIcon,
    ExchangeIcon,
    PartnersIcon,
    EtherDeltaIcon,
    AtmIcon,
    ShopIcon,
    TransferIcon,
    InvestIcon,
    LockIcon,
    WaitIcon,
    PremiumIcon
} from '../../../components/Icons';

import petrovics from 'assets/images/team/ppetrovics.jpg';
import bdebreczeni from 'assets/images/team/bdebreczeni.jpg';
import kszabo from 'assets/images/team/kszabo.jpg';
import bjackson from 'assets/images/team/bjackson.jpg';
import emarton from 'assets/images/team/emarton.jpg';
import lheves from 'assets/images/team/lheves.jpg';
import vszatmahry from 'assets/images/team/vszatmahry.jpg';
import thume from 'assets/images/team/thume.jpg';

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

export const keyBenefits = [
    {
        pk: 'benefit-1',
        type: 'business',
        text: 'Offer your services in a variety of digital currencies',
    },
    {
        pk: 'benefit-2',
        type: 'business',
        text: 'Keep prices simple by using a digital currency people can relate to',
    },
    {
        pk: 'benefit-3',
        type: 'business',
        text: 'Lower costs and reduce time by avoiding financial institutions',
    },
    {
        pk: 'benefit-4',
        type: 'individual',
        text: 'Move money between exchanges with peace of mind',
    },
    {
        pk: 'benefit-5',
        type: 'individual',
        text: 'Spend your cryptocurrencies without losing from future earnings',
    },
    {
        pk: 'benefit-6',
        type: 'individual',
        text: 'Utilise the blockchain with secure, decentralised way of spending',
    },
];

export const howItWorks = [
    {
        pk: 'hiw-1',
        image: <DepositIcon/>,
        type: 'loan',
        title: 'Deposit ETH',
        text: 'Get liquid A-EUR using your ETH as collateral.',
    },
    {
        pk: 'hiw-2',
        image: <SpendIcon/>,
        type: 'loan',
        title: 'Spend A-EUR',
        text: 'Use your A-EUR or convert it to fiat. You stay in your ETH position in the meanwhile.',
    },
    {
        pk: 'hiw-3',
        image: <GetDepositIcon/>,
        type: 'loan',
        title: 'Get deposit back',
        text: 'Payback your loan at maturity to get back your ETH collateral.',
    },
    {
        pk: 'hiw-4',
        image: <ExchangeIcon/>,
        type: 'exchange',
        title: 'Augmint Exchange',
        text: 'Buy or sell A-EUR for ETH on Augmint’s decentralised internal exchange.',
    },
    {
        pk: 'hiw-5',
        image: <PartnersIcon/>,
        type: 'exchange',
        title: 'Partners',
        text: 'Buy or sell A-EUR for fiat on one of our partner gateways.',
    },
    {
        pk: 'hiw-6',
        image: <EtherDeltaIcon/>,
        type: 'exchange',
        title: 'EtherDelta',
        text: 'Trade with A-EUR on anu ERC20 exchanges like EtherDelta.',
    },
    {
        pk: 'hiw-7',
        image: <AtmIcon/>,
        type: 'use',
        title: 'ATMS',
        text: 'Withdraw fiat cash from your A-EUR account at one of our partners’ ATMs.',
    },
    {
        pk: 'hiw-8',
        image: <ShopIcon/>,
        type: 'use',
        title: 'Shops',
        text: 'Use your A-EUR at partner merchants.',
    },
    {
        pk: 'hiw-9',
        image: <TransferIcon/>,
        type: 'use',
        title: 'Transfer',
        text: ' Send your A-EUR to any other A-EUR account.',
    },
    {
        pk: 'hiw-10',
        image: <InvestIcon/>,
        type: 'use',
        title: 'Use in smart contracts',
        text: 'A-EUR is usable in any smart contract service because it’s ERC-20 standard token.',
    },
    {
        pk: 'hiw-11',
        image: <LockIcon/>,
        type: 'lock',
        title: 'Lock',
        text: 'Choose lock time. Your premium is immediately credited to your lock account.',
    },
    {
        pk: 'hiw-12',
        image: <WaitIcon/>,
        type: 'lock',
        title: 'Wait',
        text: '',
    },
    {
        pk: 'hiw-13',
        image: <PremiumIcon/>,
        type: 'lock',
        title: 'Get premium',
        text: 'Your locked amount including your premium is available.',
    },

    
];

export const teamMembers = [
    {
        pk: 'team-1',
        name: 'Peter Petrovics',
        imgSrc: petrovics,
        title: 'Founder, technologist',
    },
    {
        pk: 'team-2',
        name: 'Karoly Szabo',
        imgSrc: kszabo,
        title: 'Founder, economist',
    },
    {
        pk: 'team-3',
        name: 'Marton Elek',
        imgSrc: emarton,
        title: 'Marketing, PR strategy',
    },
    {
        pk: 'team-4',
        name: 'Barnabas Debreczeni',
        imgSrc: bdebreczeni,
        title: 'Cryptocurrency specialist, Shinrai founder',
    },
    {
        pk: 'team-5',
        name: 'Viktor Szathmáry',
        imgSrc: vszatmahry,
        title: 'Blockchain expert / development',
    },
    {
        pk: 'team-6',
        name: 'Ben Jackson',
        imgSrc: bjackson,
        title: 'Blockchain developer',
    },
    {
        pk: 'team-7',
        name: 'Tom Hume',
        imgSrc: thume,
        title: 'Branding & Visual',
    },
    {
        pk: 'team-8',
        name: 'Laszlo Heves',
        imgSrc: lheves,
        title: 'Frontend, UX developer',
    }
];
