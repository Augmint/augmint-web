import React from "react";
import Button from "components/augmint-ui/button";
import { Pblock } from "components/PageLayout";

import HDKey from "hdkey";
import ethUtil from "ethereumjs-util";

import { TrezorConnect } from "utils/trezor-connectv4";
import Transport from "@ledgerhq/hw-transport-u2f";
import Eth from "@ledgerhq/hw-app-eth";

// const handleGetAddress = async e => {
//     // "m/44'/60'/0'/0/0" "m/44'/60'/0'/0/1" https://github.com/kvhnuke/etherwallet/blob/0edc285ac964e450d845efc23e3deb3e81f0a7fb/app/scripts/controllers/decryptWalletCtrl.js#L18
//     TrezorConnect.ethereumGetAddress(0, function(result) {
//         if (result.success) {
//             console.log(result);
//         } else {
//             console.error("Error:", result.error); // error message
//         }
//     });
// };

const handleTrezorGetAccounts = async e => {
    //"m/44'/60'/0'/0"   "m/44'/60'/1'/0"
    const accountIndex = 0;
    TrezorConnect.getXPubKey(`m/44'/60'/${accountIndex}'/0`, function(result) {
        if (result.success) {
            // this works with trezor but ledger doesn't return xpubkey so using generic fx w/ pubkey & chaincode
            //const hdk = HDKey.fromExtendedKey(result.xpubkey);

            const addresses = getDerivedAddresses(result.publicKey, result.chainCode);
            console.log(`  Trezor account #${accountIndex + 1} addresses: ${addresses}`);
            alert("check console log");
        } else {
            console.error("Error:", result.error); // error message
        }
    });
};

const handleLedgerGetAccounts = async e => {
    const accountIndex = 0;
    /* TODO: modal with timeout and instructions:
         1. connect Ledger & unlock it
         2. start Ethereum app (make sure browser support is enabled in settings)
    */
    const transport = await Transport.create();
    const eth = new Eth(transport);
    const result = await eth.getAddress(`44'/60'/${accountIndex}'`, false, true);

    const addresses = getDerivedAddresses(result.publicKey, result.chainCode);
    console.log(`  Ledger account #${accountIndex + 1} addresses: ${addresses}`);
    alert("check console log");
};

function getDerivedAddresses(publicKey, chainCode, addressCount = 5) {
    const hdk = new HDKey();
    hdk.publicKey = new Buffer(publicKey, "hex");
    hdk.chainCode = new Buffer(chainCode, "hex");
    const addresses = [];
    for (let i = 0; i < 5; i++) {
        const derived = hdk.derive("m/" + i);
        const addressBuffer = ethUtil.publicToAddress(derived.publicKey, true);
        addresses.push(ethUtil.toChecksumAddress("0x" + addressBuffer.toString("hex")));
    }
    return addresses;
}

export default class HWWallets extends React.Component {
    render() {
        return (
            <Pblock header="Hardware wallets">
                <Button type="submit" size="small" onClick={handleTrezorGetAccounts}>
                    Trezor addresses
                </Button>
                <Button type="submit" size="small" onClick={handleLedgerGetAccounts}>
                    Ledger addresses
                </Button>
            </Pblock>
        );
    }
}
