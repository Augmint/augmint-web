
import React from "react";

import {Image} from 'semantic-ui-react';

import stableSVG from "assets/images/stable.svg";
import decentralizedSVG from "assets/images/decentralized.svg";
import secureSVG from "assets/images/secure.svg";
import downArrowSVG from "assets/images/down-arrow.svg";
import interchangeSVG from "assets/images/interchange.svg";

import depositPng from "assets/images/deposit-eth.png";
import depositPng2x from "assets/images/deposit-eth@2x.png";
import depositPng3x from "assets/images/deposit-eth@3x.png";

import getDepositPng from "assets/images/get-deposit.png";
import getDepositPng2x from "assets/images/get-deposit@2x.png";
import getDepositPng3x from "assets/images/get-deposit@3x.png";

import spendEuroPng from "assets/images/spend-euro.png";
import spendEuroPng2x from "assets/images/spend-euro@2x.png";
import spendEuroPng3x from "assets/images/spend-euro@3x.png";

import exchangePng from "assets/images/exchange.png";
import exchangePng2x from "assets/images/exchange@2x.png";
import exchangePng3x from "assets/images/exchange@3x.png";

import partnersPng from "assets/images/partners.png";
import partnersPng2x from "assets/images/partners@2x.png";
import partnersPng3x from "assets/images/partners@3x.png";

import ethDPng from "assets/images/ether-delta.png";
import ethDPng2x from "assets/images/ether-delta@2x.png";
import ethDPng3x from "assets/images/ether-delta@3x.png";

import atmPng from "assets/images/atm.png";
import atmPng2x from "assets/images/atm@2x.png";
import atmPng3x from "assets/images/atm@3x.png";

import shopPng from "assets/images/shop.png";
import shopPng2x from "assets/images/shop@2x.png";
import shopPng3x from "assets/images/shop@3x.png";

import transferPng from "assets/images/transfer.png";
import transferPng2x from "assets/images/transfer@2x.png";
import transferPng3x from "assets/images/transfer@3x.png";

import investPng from "assets/images/invest.png";
import investPng2x from "assets/images/invest@2x.png";
import investPng3x from "assets/images/invest@3x.png";

import lockPng from "assets/images/lock.png";
import lockPng2x from "assets/images/lock@2x.png";
import lockPng3x from "assets/images/lock@3x.png";

import waitPng from "assets/images/wait.png";
import waitPng2x from "assets/images/wait@2x.png";
import waitPng3x from "assets/images/wait@3x.png";

import premiumPng from "assets/images/premium.png";
import premiumPng2x from "assets/images/premium@2x.png";
import premiumPng3x from "assets/images/premium@3x.png";

export const BalanceIcon = () => (
  <Image centered>
  <svg xmlns="http://www.w3.org/2000/svg" width="393" height="148" viewBox="0 0 393 148">
    <defs>
        <linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="70.821%">
            <stop offset="0%" stopColor="#FFAD00"/>
            <stop offset="100%" stopColor="#FFAD00" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="b" x1="50%" x2="50%" y1="0%" y2="70.821%">
            <stop offset="0%" stopColor="#FFAD00" stopOpacity=".99"/>
            <stop offset="100%" stopColor="#FFAD00" stopOpacity="0"/>
        </linearGradient>
    </defs>
    <g fill="none" fillRule="evenodd">
        <circle cx="41.5" cy="41.5" r="41.5" fill="url(#a)"/>
        <circle cx="350.5" cy="41.5" r="41.5" fill="url(#b)"/>
        <path fill="#FFF" d="M196.5 83H1v5h193l-30 60h66l-30-60h193v-5H197.5l-.5-1-.5 1z" opacity=".124"/>
        <path fill="#FFF" d="M25 113.9h7.021v-1.02h-5.916v-4.624h5.44v-.986h-5.44v-4.25h5.916V102H25v11.9zm9.741-3.128c0 2.431 1.377 3.383 3.213 3.383 1.751 0 2.448-1.122 2.448-1.122h.034v.867h1.105v-9.01h-1.105v5.661c0 1.547-.748 2.584-2.227 2.584-1.7 0-2.363-.697-2.363-2.567v-5.678h-1.105v5.882zm9.86 3.128h1.105v-5.865c0-1.479.748-2.142 1.7-2.142.527 0 .714.136.714.136l.221-1.122s-.255-.17-.765-.17c-.646 0-1.462.323-1.87 1.122h-.034v-.969h-1.071v9.01zm9.316-.765c1.547 0 2.856-1.309 2.856-3.74s-1.258-3.74-2.856-3.74c-1.632 0-2.941 1.258-2.941 3.74s1.343 3.74 2.941 3.74zm0 1.02c-2.261 0-4.046-1.683-4.046-4.76s1.887-4.76 4.046-4.76c2.108 0 3.961 1.683 3.961 4.76s-1.734 4.76-3.961 4.76zM332.585 113.9l-.901-2.567h-5.678l-.901 2.567H324l4.267-11.9h1.156l4.267 11.9h-1.105zm-3.757-10.557l-2.499 7.106h5.032l-2.499-7.106h-.034zm6.307 5.236h5.593v-1.105h-5.593v1.105zm8.313 5.321h7.021v-1.02h-5.916v-4.624h5.44v-.986h-5.44v-4.25h5.916V102h-7.021v11.9zm9.741-3.128c0 2.431 1.377 3.383 3.213 3.383 1.751 0 2.448-1.122 2.448-1.122h.034v.867h1.105v-9.01h-1.105v5.661c0 1.547-.748 2.584-2.227 2.584-1.7 0-2.363-.697-2.363-2.567v-5.678h-1.105v5.882zm9.86 3.128h1.105v-5.865c0-1.479.748-2.142 1.7-2.142.527 0 .714.136.714.136l.221-1.122s-.255-.17-.765-.17c-.646 0-1.462.323-1.87 1.122h-.034v-.969h-1.071v9.01zm9.316-.765c1.547 0 2.856-1.309 2.856-3.74s-1.258-3.74-2.856-3.74c-1.632 0-2.941 1.258-2.941 3.74s1.343 3.74 2.941 3.74zm0 1.02c-2.261 0-4.046-1.683-4.046-4.76s1.887-4.76 4.046-4.76c2.108 0 3.961 1.683 3.961 4.76s-1.734 4.76-3.961 4.76z"/>
    </g>
  </svg>
  </Image>
);

export const StableIcon = () => (
  <Image centered src={stableSVG} />
);

export const DecentralizedIcon = () => (
  <Image centered src={decentralizedSVG} />
);

export const SecureIcon = () => (
  <Image centered src={secureSVG} />
);

export const DownArrowIcon = () => (
  <Image centered src={downArrowSVG} />
);

export const InterchangeIcon = () => (
  <Image src={interchangeSVG} />
);

export const DepositIcon = () => (
  <Image src={depositPng} srcSet={`${depositPng2x} 2x, ${depositPng3x} 3x,`}/>
);

export const SpendIcon = () => (
  <Image src={spendEuroPng} srcSet={`${spendEuroPng2x} 2x, ${spendEuroPng3x} 3x,`}/>
);

export const GetDepositIcon = () => (
  <Image src={getDepositPng} srcSet={`${getDepositPng2x} 2x, ${getDepositPng3x} 3x,`}/>
);

export const ExchangeIcon = () => (
  <Image src={exchangePng} srcSet={`${exchangePng2x} 2x, ${exchangePng3x} 3x,`}/>
);

export const PartnersIcon = () => (
  <Image src={partnersPng} srcSet={`${partnersPng2x} 2x, ${partnersPng3x} 3x,`}/>
);

export const EtherDeltaIcon = () => (
  <Image src={ethDPng} srcSet={`${ethDPng2x} 2x, ${ethDPng3x} 3x,`}/>
);

export const AtmIcon = () => (
  <Image src={atmPng} srcSet={`${atmPng2x} 2x, ${atmPng3x} 3x,`}/>
);

export const ShopIcon = () => (
  <Image src={shopPng} srcSet={`${shopPng2x} 2x, ${shopPng3x} 3x,`}/>
);

export const TransferIcon = () => (
  <Image src={transferPng} srcSet={`${transferPng2x} 2x, ${transferPng3x} 3x,`}/>
);

export const InvestIcon = () => (
  <Image src={investPng} srcSet={`${investPng2x} 2x, ${investPng3x} 3x,`}/>
);

export const LockIcon = () => (
  <Image src={lockPng} srcSet={`${lockPng2x} 2x, ${lockPng3x} 3x,`}/>
);

export const WaitIcon = () => (
  <Image src={waitPng} srcSet={`${waitPng2x} 2x, ${waitPng3x} 3x,`}/>
);

export const PremiumIcon = () => (
  <Image src={premiumPng} srcSet={`${premiumPng2x} 2x, ${premiumPng3x} 3x,`}/>
);
