import { default as Contract } from "truffle-contract";
import ethers from "ethers";

/*  using a mix of 3 different contract abstractions: web3.Contract, truffle-contract and ethers.
    It's a temporary workaround for some issues with each which is working in others (e.g. getLogs, subscribe etc. )
TODO: consolidate to use one library (likely web3 will be enough once websocket works with Metamask) */
export default class SolidityContract {
    constructor(connection, web3ContractInstance, truffleContractInstance, ethersContractInstance, abi) {
        this.instance = truffleContractInstance; // this the default now. we will transition to one lib
        this.web3ContractInstance = web3ContractInstance;
        this.truffleInstance = truffleContractInstance;
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

    static connectNew(connection, artifacts) {
        const contract = Contract(artifacts);
        contract.setProvider(connection.web3Instance.currentProvider);
        contract.setNetwork(connection.network.id);

        const truffleContractInstance = contract.at(contract.address);
        const web3ContractInstance = new connection.web3Instance.eth.Contract(contract.abi, contract.address);

        // TODO: add extra check  because .deployed() returns an instance even when contract is not deployed
        // const contractName = artifacts.contract_name;
        // throw new Error("Can't connect to " + contractName + " contract. Owner is 0x. Not deployed?");

        const provider = connection.ethers.provider;
        const ethersContractInstance = new ethers.Contract(contract.address, contract.abi, provider);
        return new SolidityContract(
            connection,
            web3ContractInstance,
            truffleContractInstance,
            ethersContractInstance,
            contract.abi
        );
    }
}
