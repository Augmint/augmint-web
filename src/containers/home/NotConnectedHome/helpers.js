import React from "react";

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
} from "components/Icons";

import petrovics from "assets/images/team/ppetrovics.jpg";
import bdebreczeni from "assets/images/team/bdebreczeni.jpg";
import kszabo from "assets/images/team/kszabo.jpg";
import bjackson from "assets/images/team/bjackson.jpg";
import emarton from "assets/images/team/emarton.jpg";
import lheves from "assets/images/team/lheves.jpg";
import vszatmahry from "assets/images/team/vszatmahry.jpg";
import thume from "assets/images/team/thume.jpg";
import vkontra from "assets/images/team/vkontra.jpg";
import gycsado from "assets/images/team/gycsado.jpg";
import aszabo from "assets/images/team/aszabo.jpg";
import tnadrai from "assets/images/team/tnadrai.jpg";
import pkolcza from "assets/images/team/pkolcza.jpg";
import dkovacs from "assets/images/team/dkovacs.jpg";
import aridovics from "assets/images/team/aridovics.jpg";

import decent from "assets/images/decent.png";
import decentlabs from "assets/images/decentlabs.png";

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

export const keyBenefits = [
    {
        pk: "benefit-1",
        type: "business",
        text: "Offer your services in a variety of digital currencies"
    },
    {
        pk: "benefit-2",
        type: "business",
        text: "Keep prices simple by using a digital currency people can relate to"
    },
    {
        pk: "benefit-3",
        type: "business",
        text: "Lower costs and reduce time by avoiding financial institutions"
    },
    {
        pk: "benefit-4",
        type: "individual",
        text: "Move money between exchanges with peace of mind"
    },
    {
        pk: "benefit-5",
        type: "individual",
        text: "Spend your cryptocurrencies without losing from future earnings"
    },
    {
        pk: "benefit-6",
        type: "individual",
        text: "Utilize the blockchain with a secure, decentralised way of spending"
    }
];

export const howItWorks = [
    {
        pk: "hiw-1",
        image: <DepositIcon />,
        type: "loan",
        title: "Deposit ETH",
        text: "Get liquid A-Euro using your ETH as collateral."
    },
    {
        pk: "hiw-2",
        image: <SpendIcon />,
        type: "loan",
        title: "Spend A-Euro",
        text: "Use your A-Euro or convert it to fiat. Stay in your ETH position in the meanwhile."
    },
    {
        pk: "hiw-3",
        image: <GetDepositIcon />,
        type: "loan",
        title: "Get deposit back",
        text: "Payback your loan at maturity to get back your ETH collateral."
    },
    {
        pk: "hiw-4",
        image: <ExchangeIcon />,
        type: "exchange",
        title: "Augmint Exchange",
        text: "Buy or sell A-Euro for ETH on Augmint’s exchange."
    },
    {
        pk: "hiw-5",
        image: <PartnersIcon />,
        type: "exchange",
        title: "Partners",
        text: "Buy or sell A-Euro for fiat on one of our partner gateways."
    },
    {
        pk: "hiw-6",
        image: <EtherDeltaIcon />,
        type: "exchange",
        title: "EtherDelta",
        text: "Trade with A-Euro on anu ERC20 exchanges like EtherDelta."
    },
    {
        pk: "hiw-7",
        image: <AtmIcon />,
        type: "use",
        title: "ATMS",
        text: "Withdraw fiat cash from your A-Euro account at one of our partners’ ATMs."
    },
    {
        pk: "hiw-8",
        image: <ShopIcon />,
        type: "use",
        title: "Shops",
        text: "Use your A-Euro at partner merchants."
    },
    {
        pk: "hiw-9",
        image: <TransferIcon />,
        type: "use",
        title: "Transfer",
        text: " Send your A-Euro to any other A-Euro account."
    },
    {
        pk: "hiw-10",
        image: <InvestIcon />,
        type: "use",
        title: "Use in smart contracts",
        text: "A-Euro is usable in any smart contract service because it’s ERC-20 standard token."
    },
    {
        pk: "hiw-11",
        image: <LockIcon />,
        type: "lock",
        title: "Lock",
        text: "Choose lock time. Your premium is immediately credited to your lock account."
    },
    {
        pk: "hiw-12",
        image: <WaitIcon />,
        type: "lock",
        title: "Wait",
        text: "Earn while sleeping."
    },
    {
        pk: "hiw-13",
        image: <PremiumIcon />,
        type: "lock",
        title: "Get premium",
        text: "Your unlocked amount including your premium is available."
    }
];

export const founders = [
    {
        pk: "team-1",
        firstName: "Peter",
        lastName: "Petrovics",
        imgSrc: petrovics,
        title: "Co-Founder, technologist",
        linkedinUrl: "https://www.linkedin.com/in/petrovics",
        githubUrl: "https://github.com/szerintedmi",
        description:
            "Peter is a serial entrepreneur with 20+ years technical, management and financial experience. He ran his own software house for nine years, managed tons of software projects and launched several successful startups, including Hungary's largest social network before Facebook."
    },
    {
        pk: "team-2",
        firstName: "Karoly",
        lastName: "Szabo",
        imgSrc: kszabo,
        title: "Co-Founder, economist",
        githubUrl: "https://github.com/krosza",
        description:
            "Károly is an entrepreneur with 30+ years management and financial experience. He managed and set up government agencies and business companies, supervised IT development projects. He worked a decade as a managing director of one of the largest Hungarian banks."
    }
];

export const teamMembers = [
    {
        pk: "team-3",
        firstName: "Marton",
        lastName: "Elek",
        imgSrc: emarton,
        title: "Marketing, PR strategy",
        linkedinUrl: "https://www.linkedin.com/in/marton-elek",
        description:
            "Network building specialist with creative marketing and PR strategy skills. 25 years startup building experience with focus on UX  and conscious branding"
    },
    {
        pk: "team-4",
        firstName: "Barnabas",
        lastName: "Debreczeni",
        imgSrc: bdebreczeni,
        title: "Cryptocurrency specialist, Shinrai founder",
        linkedinUrl: "https://www.linkedin.com/in/bdebreczeni",
        description:
            "Pioneer of decentralised cryptocurrencies, active member of blockchain community, officer of the Hungarian Blockchain Society and organizer of blockchain meetups."
    },
    {
        pk: "team-5",
        firstName: "Viktor",
        lastName: "Szathmáry",
        imgSrc: vszatmahry,
        title: "Blockchain expert / development",
        linkedinUrl: "https://www.linkedin.com/in/phraktle",
        githubUrl: "https://github.com/phraktle",
        description:
            "Software developer, entrepreneur, angel investor. Founder of decent.org, a non-profit organization researching and promoting decentralized technologies. 20 years of experience in building startups."
    },
    {
        pk: "team-6",
        firstName: "Ben",
        lastName: "Jackson",
        imgSrc: bjackson,
        title: "Blockchain developer",
        linkedinUrl: "https://www.linkedin.com/in/ben-jackson-0686a896",
        githubUrl: "https://github.com/BYossarian",
        description:
            "Software developer, and former mathematician, who loves the wild west of decentralised technologies."
    },
    {
        pk: "team-7",
        firstName: "Tom",
        lastName: "Hume",
        imgSrc: thume,
        title: "Branding & Visual",
        linkedinUrl: "https://www.linkedin.com/in/tom-hume-31b64014a",
        portfolio: "http://studiojubilee.com",
        description:
            "Partner of <a href='http://studiojubilee.com' target='_blank'>Studio Jubilee</a>, a design practice focused on branding, digital design, and strategy. <a href='http://studiojubilee.com' target='_blank'>Studio Jubilee</a> works with innovative startups and global brands."
    },
    {
        pk: "team-8",
        firstName: "Laszlo",
        lastName: "Heves",
        imgSrc: lheves,
        title: "Frontend, UX developer",
        linkedinUrl: "https://www.linkedin.com/in/lheves",
        githubUrl: "https://github.com/reyrodrigez",
        description:
            "Laci has 8+ years of experience building medium and large sized websites and applications . He helps in building the frontend but also  making sure users have a great experience using Augmint."
    },
    {
        pk: "team-9",
        firstName: "Verka",
        lastName: "Kontra",
        imgSrc: vkontra,
        title: "Financial expert",
        linkedinUrl: "https://www.linkedin.com/in/veronika-kontra-321328143",
        description: "Finance professional with 5+ years of experience in valuation, financial modeling and analysis."
    },
    {
        pk: "team-10",
        firstName: "Gyorgy",
        lastName: "Csado",
        imgSrc: gycsado,
        title: "Frontend developer",
        linkedinUrl: "https://www.linkedin.com/in/gy%C3%B6rgy-csad%C3%B3-771739bb",
        githubUrl: "https://github.com/gyurka00",
        description:
            "Gyurka is experienced making sites work as good as they look. He works on Augmint<a href='https://euedge.com' target='_blank'> from EU Edge.</a>"
    },
    {
        pk: "team-11",
        firstName: "Tamas",
        lastName: "Nadrai",
        imgSrc: tnadrai,
        title: "Full stack developer",
        linkedinUrl: "https://www.linkedin.com/in/nadrai/",
        githubUrl: "https://github.com/CryppTom",
        description:
            "Tamas has 8+ years experience in software development and testing. He is a blockchain and cryptocurrency enthusiast since 2017."
    },
    {
        pk: "team-12",
        firstName: "Peter",
        lastName: "Kolcza",
        imgSrc: pkolcza,
        title: "IT consultant, backend developer",
        linkedinUrl: "https://www.linkedin.com/in/p%C3%A9ter-kolcza-0b04bb8/",
        description:
            "Peter has 10+ years of experience in building enterprise solutions for financial institutions in the areas of loans and data quality. He performs best when complex problems should be solved: when technology meets finance, tax, business and complience."
    },
    {
        pk: "team-13",
        firstName: "David",
        lastName: "Kovacs",
        imgSrc: dkovacs,
        title: "Project management",
        linkedinUrl: "https://www.linkedin.com/in/kovacsd/",
        description:
            "David’s background is in Project Management - he has lived in several countries, having most recently spent 2 years in San Francisco in the tech startup scene. Outside of work, he is a triathlete and ultra runner."
    },
    {
        pk: "team-14",
        firstName: "Adam",
        lastName: "Ridovics",
        imgSrc: aridovics,
        title: "Frontend developer, designer",
        linkedinUrl: "https://www.linkedin.com/in/adamridovics/",
        description:
            "Frontend developer, creative & designer with years of experience in visual communication, ui, ux & product design and building & managing products/startups from the ground up."
    }
];

export const partners = [
    {
        pk: "partner-1",
        name: "Decent",
        imgSrc: decent,
        description: "<a href='http://www.decent.org/' target='_blank'>Augmint was born at Decent.</a>",
        slackText: "Join Decent's slack.",
        slackUrl: "https://decent-slack-autoinvite.herokuapp.com"
    },
    {
        pk: "partner-2",
        name: "Decent Labs",
        imgSrc: decentlabs,
        description:
            "<a href='https://decent.org/' target='_blank'>Decent Labs</a> is supporting Augmint as a technical partner."
    }
];
