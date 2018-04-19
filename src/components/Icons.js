import React from "react";

import { Image } from "semantic-ui-react";

import stableSVG from "assets/images/stable.svg";
import decentralizedSVG from "assets/images/decentralized.svg";
import secureSVG from "assets/images/secure.svg";
import downArrowSVG from "assets/images/down-arrow.svg";
import interchangeSVG from "assets/images/interchange.svg";

import depositSVG from "assets/images/deposit-eth.svg";

import getDepositSVG from "assets/images/get-deposit.svg";

import spendEuroSVG from "assets/images/spend-euro.svg";

import exchangeSVG from "assets/images/exchange.svg";

import partnersSVG from "assets/images/partners.svg";

import ethDSVG from "assets/images/ether-delta.svg";

import atmSVG from "assets/images/atm.svg";

import shopSVG from "assets/images/shop.svg";

import transferSVG from "assets/images/transfer.svg";

import investSVG from "assets/images/invest.svg";

import lockSVG from "assets/images/lock.svg";

import waitSVG from "assets/images/wait.svg";

import premiumSVG from "assets/images/premium.svg";

import augmintSVG from "assets/images/logo/augmint.svg";

export const BalanceIcon = () => (
    <Image centered>
        <svg xmlns="http://www.w3.org/2000/svg" width="393" height="148" viewBox="0 0 393 148">
            <defs>
                <linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="70.821%">
                    <stop offset="0%" stopColor="#FFAD00" />
                    <stop offset="100%" stopColor="#FFAD00" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="b" x1="50%" x2="50%" y1="0%" y2="70.821%">
                    <stop offset="0%" stopColor="#FFAD00" stopOpacity=".99" />
                    <stop offset="100%" stopColor="#FFAD00" stopOpacity="0" />
                </linearGradient>
            </defs>
            <g fill="none" fillRule="evenodd">
                <circle cx="41.5" cy="41.5" r="41.5" fill="url(#a)" />
                <circle cx="350.5" cy="41.5" r="41.5" fill="url(#b)" />
                <path fill="#FFF" d="M196.5 83H1v5h193l-30 60h66l-30-60h193v-5H197.5l-.5-1-.5 1z" opacity=".124" />
                <path
                    fill="#FFF"
                    d="M25 113.9h7.021v-1.02h-5.916v-4.624h5.44v-.986h-5.44v-4.25h5.916V102H25v11.9zm9.741-3.128c0 2.431 1.377 3.383 3.213 3.383 1.751 0 2.448-1.122 2.448-1.122h.034v.867h1.105v-9.01h-1.105v5.661c0 1.547-.748 2.584-2.227 2.584-1.7 0-2.363-.697-2.363-2.567v-5.678h-1.105v5.882zm9.86 3.128h1.105v-5.865c0-1.479.748-2.142 1.7-2.142.527 0 .714.136.714.136l.221-1.122s-.255-.17-.765-.17c-.646 0-1.462.323-1.87 1.122h-.034v-.969h-1.071v9.01zm9.316-.765c1.547 0 2.856-1.309 2.856-3.74s-1.258-3.74-2.856-3.74c-1.632 0-2.941 1.258-2.941 3.74s1.343 3.74 2.941 3.74zm0 1.02c-2.261 0-4.046-1.683-4.046-4.76s1.887-4.76 4.046-4.76c2.108 0 3.961 1.683 3.961 4.76s-1.734 4.76-3.961 4.76zM332.585 113.9l-.901-2.567h-5.678l-.901 2.567H324l4.267-11.9h1.156l4.267 11.9h-1.105zm-3.757-10.557l-2.499 7.106h5.032l-2.499-7.106h-.034zm6.307 5.236h5.593v-1.105h-5.593v1.105zm8.313 5.321h7.021v-1.02h-5.916v-4.624h5.44v-.986h-5.44v-4.25h5.916V102h-7.021v11.9zm9.741-3.128c0 2.431 1.377 3.383 3.213 3.383 1.751 0 2.448-1.122 2.448-1.122h.034v.867h1.105v-9.01h-1.105v5.661c0 1.547-.748 2.584-2.227 2.584-1.7 0-2.363-.697-2.363-2.567v-5.678h-1.105v5.882zm9.86 3.128h1.105v-5.865c0-1.479.748-2.142 1.7-2.142.527 0 .714.136.714.136l.221-1.122s-.255-.17-.765-.17c-.646 0-1.462.323-1.87 1.122h-.034v-.969h-1.071v9.01zm9.316-.765c1.547 0 2.856-1.309 2.856-3.74s-1.258-3.74-2.856-3.74c-1.632 0-2.941 1.258-2.941 3.74s1.343 3.74 2.941 3.74zm0 1.02c-2.261 0-4.046-1.683-4.046-4.76s1.887-4.76 4.046-4.76c2.108 0 3.961 1.683 3.961 4.76s-1.734 4.76-3.961 4.76z"
                />
            </g>
        </svg>
    </Image>
);

export const StableIcon = () => <Image centered src={stableSVG} />;

export const DecentralizedIcon = () => <Image centered src={decentralizedSVG} />;

export const SecureIcon = () => <Image centered src={secureSVG} />;

export const DownArrowIcon = () => <Image centered src={downArrowSVG} />;

export const InterchangeIcon = () => <Image src={interchangeSVG} className="interchange-icon" />;

export const DepositIcon = () => <Image src={depositSVG} />;

export const SpendIcon = () => <Image src={spendEuroSVG} />;

export const GetDepositIcon = () => <Image src={getDepositSVG} />;

export const ExchangeIcon = () => <Image src={exchangeSVG} />;

export const PartnersIcon = () => <Image src={partnersSVG} />;

export const EtherDeltaIcon = () => <Image src={ethDSVG} />;

export const AtmIcon = () => <Image src={atmSVG} />;

export const ShopIcon = () => <Image src={shopSVG} />;

export const TransferIcon = () => <Image src={transferSVG} />;

export const InvestIcon = () => <Image src={investSVG} />;

export const LockIcon = () => <Image src={lockSVG} />;

export const WaitIcon = () => <Image src={waitSVG} />;

export const PremiumIcon = () => <Image src={premiumSVG} />;

export const AugmintIcon = () => <Image src={augmintSVG} className="augmint" />;
