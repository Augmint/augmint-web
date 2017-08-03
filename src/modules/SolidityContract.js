import { default as Contract } from 'truffle-contract';

export default class SolidityContract {
        constructor (instance) {
            this.instance = instance;
        }

        static async connectNew(provider, artifacts) {
            var contractDef = Contract(artifacts);
            contractDef.setProvider(provider);
            var instance = await contractDef.deployed();
            // TODO: check if this contract exists (ie. deployed() doesn't return error when contract is not deployed)
            return new SolidityContract(instance) ;
        }

        static async connectNewAt(provider, artifacts, address) {
            let contractDef = Contract(artifacts);
            contractDef.setProvider(provider);
            let instance = await contractDef.at(address);
            return new SolidityContract(instance) ;
        }
}
