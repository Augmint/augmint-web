import { default as Contract } from "truffle-contract";
export default class SolidityContract {
    constructor(web3, instance) {
        this.instance = instance;
        this.abiDecoder = require("./abi-decoder");
        this.abiDecoder.addABI(web3, instance.abi);
    }

    static async connectNew(web3, artifacts) {
        let contract = Contract(artifacts);
        contract.setProvider(web3.currentProvider);
        //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
        if (typeof contract.currentProvider.sendAsync !== "function") {
            contract.currentProvider.sendAsync = function() {
                return contract.currentProvider.send.apply(
                    contract.currentProvider,
                    arguments
                );
            };
        }
        let instance = await contract.deployed();
        // This extra check needed because .deployed() returns an instance
        //      even when contract is not deployed
        // TODO: find out if there is a better way to do it
        //      (especially for contracts which don't have owner prop)
        if (typeof instance.owner === "function") {
            let owner = await instance.owner();

            if (owner === "0x") {
                let contractName = artifacts.contract_name;
                throw new Error(
                    "Can't connect to " +
                        contractName +
                        " contract. Owner is 0x. Not deployed?"
                );
            }
        }
        return new SolidityContract(web3, instance);
    }

    static async connectNewAt(web3, artifacts, address) {
        let contract = Contract(artifacts);
        contract.setProvider(web3.currentProvider);
        let instance = await contract.at(address);
        return new SolidityContract(web3, instance);
    }
}
