import { default as Contract } from "truffle-contract";
import ethers from "ethers";

/*  connecting to both web3 and ethers contract instance is temporary fix for web3 event issues
TODO: should we and could we get rid of web3 contract? */
export default class SolidityContract {
    constructor(connection, web3ContractInstance, ethersContractInstance, abi) {
        this.instance = web3ContractInstance;
        this.ethersInstance = ethersContractInstance;
        this.address = ethers.utils.getAddress(ethersContractInstance.address); // format it checksummed
        this.abi = abi; // storing this to be ethereum js lib independent

        // this.deployedAtBlock is used for filters' fromBlock - no point to query from earlier
        // FIXME: how to get the blockNumber of the contract deployment?

        let startBlock;
        switch (connection.network.name) {
            case "Main":
                startBlock = 4992980;
                break;
            case "Rinkeby":
                startBlock = 1661751;
                break;
            case "Ropsten":
                startBlock = 2544514;
                break;
            default:
                startBlock = 0;
        }
        this.deployedAtBlock = ethers.utils.bigNumberify(startBlock).toHexString();
    }

    static async connectNew(connection, artifacts) {
        const contract = Contract(artifacts);
        contract.setProvider(connection.web3Instance.currentProvider);

        const web3ContractInstance = await contract.deployed();

        // TODO: add extra check  because .deployed() returns an instance even when contract is not deployed
        // const contractName = artifacts.contract_name;
        // throw new Error("Can't connect to " + contractName + " contract. Owner is 0x. Not deployed?");

        const provider = connection.ethers.provider;
        const ethersContractInstance = new ethers.Contract(contract.address, contract.abi, provider);
        return new SolidityContract(connection, web3ContractInstance, ethersContractInstance, contract.abi);
    }
}
