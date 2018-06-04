import React from "react";
import Button from "components/augmint-ui/button";
import { Pblock, Pgrid } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";

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

export default class HWWallets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ledgerConnecting: false,
            ledgerError: null,
            TrezorConnecting: false,
            trezorError: null
        };
    }

    getXPubKeyPromi = path => {
        return new Promise(function(resolve, reject) {
            TrezorConnect.getXPubKey(path, function(result) {
                if (result.success) {
                    resolve(result);
                } else {
                    reject(result.error);
                }
            });
        });
    };

    handleTrezorGetAccounts = async e => {
        try {
            this.setState({ trezorError: null, trezorConnecting: true });
            const accountIndex = 0;
            const result = await this.getXPubKeyPromi(`m/44'/60'/${accountIndex}'/0`);
            // this works with trezor but ledger doesn't return xpubkey so using generic fx w/ pubkey & chaincode
            //const hdk = HDKey.fromExtendedKey(result.xpubkey);

            const addresses = this.getDerivedAddresses(result.publicKey, result.chainCode);

            this.setState({ trezorConnecting: false });
            console.log(`  Trezor account #${accountIndex + 1} addresses: ${addresses}`);
            alert("Addresses from Trezor:\n" + JSON.stringify(addresses));
        } catch (error) {
            this.setState({ trezorError: error, trezorConnecting: false });
        }
    };

    handleLedgerGetAccounts = async e => {
        try {
            this.setState({ ledgerError: null, ledgerConnecting: true });
            const accountIndex = 0;
            const transport = await Transport.create();
            const eth = new Eth(transport);
            const result = await eth.getAddress(`44'/60'/${accountIndex}'`, false, true);

            const addresses = this.getDerivedAddresses(result.publicKey, result.chainCode);

            this.setState({ ledgerConnecting: false });

            console.log(`  Ledger account #${accountIndex + 1} addresses: ${addresses}`);
            alert("Addresses from Ledger:\n" + JSON.stringify(addresses));
        } catch (error) {
            console.error(error);
            this.setState({ ledgerError: error, ledgerConnecting: false });
        }
    };

    getDerivedAddresses(publicKey, chainCode, addressCount = 5) {
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

    render() {
        const { ledgerError, ledgerConnecting, trezorError, trezorConnecting } = this.state;
        return (
            <Pblock header="Hardware wallets">
                <Pgrid columns={1}>
                    <Pgrid.Column>
                        {trezorError && <ErrorPanel header="Trezor error">{trezorError}</ErrorPanel>}

                        <Button
                            type="submit"
                            size="small"
                            onClick={this.handleTrezorGetAccounts}
                            disabled={trezorConnecting}
                        >
                            {trezorConnecting ? "Connecting.." : "Trezor addresses"}
                        </Button>
                    </Pgrid.Column>
                    <Pgrid.Column>
                        <ol>
                            <li>Connect Ledger & unlock it </li>
                            <li>Start Ethereum app (make sure browser support is enabled in settings)</li>
                        </ol>

                        {ledgerError && <ErrorPanel header="Ledger error">{ledgerError.message}</ErrorPanel>}

                        <Button
                            type="submit"
                            size="small"
                            onClick={this.handleLedgerGetAccounts}
                            disabled={ledgerConnecting}
                        >
                            {ledgerConnecting ? "Connecting.." : "Ledger addresses"}
                        </Button>
                    </Pgrid.Column>
                </Pgrid>
            </Pblock>
        );
    }
}
