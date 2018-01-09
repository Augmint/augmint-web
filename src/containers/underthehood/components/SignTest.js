import React from "react";
import { Button } from "semantic-ui-react";
import { Pblock } from "components/PageLayout";

export function SignTest(props) {
    const { web3Instance, userAccount } = props.web3Connect;

    const handleSignClick = async e => {
        let encodedParams = await web3Instance.eth.abi.encodeParameters(["uint", "uint"], ["10", "20"]);
        let paramsString = "Param1: 10\nParam2: 20\n";
        let msg = paramsString + encodedParams;
        console.log(
            "solidityVerify(string msgLength, sring paramsString, uint param1, uint param2) : \n",
            '"' + msg.length + '", "' + paramsString + '", 10, 20'
        );
        console.log(
            "web3.sha3('\x19Ethereum Signed Message:\n' + msg.length + msg);",
            web3Instance.utils.soliditySha3("\x19Ethereum Signed Message:\n" + msg.length, paramsString, "10", "20")
        );

        let h = web3Instance.utils.soliditySha3("\x19Ethereum Signed Message:\n" + msg.length, msg);
        let sig = await web3Instance.eth.personal.sign(msg, userAccount);
        console.log("Account: ", userAccount, "Data: ", msg);
        let sigInRemixFormat = '["' + sig.slice(0, 4) + '"';
        for (let i = 4; i < sig.length; i += 2) {
            sigInRemixFormat += ',"0x' + sig.slice(i, i + 2) + '"';
        }
        sigInRemixFormat += "]";
        console.log('Hash + sig: "' + h + '","' + sig + '"');
        console.log('ecRecovery2(hash,sig) in remix format:\n"' + h + '", ' + sigInRemixFormat);
        console.log(
            'ecVerify(message, signer, sig) in remix format:\n"' + msg + '", "' + userAccount + '", ' + sigInRemixFormat
        );

        sig = sig.slice(2);
        let r = `0x${sig.slice(0, 64)}`;
        let s = `0x${sig.slice(64, 128)}`;
        let v = web3Instance.utils.hexToNumber(sig.slice(128, 130));

        console.log('ecRecovery(hash,v,r,s) in remix format:\n"' + h + '", ' + v + ', "' + r + '", "' + s + '"');
    };

    return (
        <Pblock header="Sign test">
            <Button size="small" onClick={handleSignClick}>
                Sign
            </Button>
        </Pblock>
    );
}
