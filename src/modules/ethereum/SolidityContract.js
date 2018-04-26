import ethers from "ethers";

/*  using a mix of 2 different contract abstractions: web3.Contract and ethers.
    It's a temporary workaround for some issues with web3 1.0 (e.g. getLogs, subscribe etc. )
TODO: consolidate to use one library (likely web3 will be enough once websocket works with Metamask) */
export default class SolidityContract {
    constructor(connection, contractAddress, abiFile) {
        this.web3ContractInstance = new connection.web3Instance.eth.Contract(abiFile.abi, contractAddress);

        const provider = connection.ethers.provider;
        this.ethersInstance = new ethers.Contract(contractAddress, abiFile.abi, provider);

        this.address = ethers.utils.getAddress(contractAddress); // format it checksummed
        this.abiVersionHash = abiFile && abiFile.abiHash;
        this.abiFile = abiFile;
        this.abi = abiFile.abi; // storing this to be ethereum js lib independent

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

    static connectLatest(connection, abiFile) {
        const contractName = abiFile.contractName;
        const abiVersionHash = abiFile.abiHash;

        const deploysFile = this.getDeploysFile(connection.network.id, contractName);

        if (
            !deploysFile.deployedAbis[abiVersionHash] ||
            !deploysFile.deployedAbis[abiVersionHash].latestDeployedAddress
        ) {
            throw new Error(
                `Couldn't find deployment info for ${contractName} with abi version ${abiVersionHash} in ${
                    deploysFile._fileName
                }`
            );
        }
        const contractAddress = deploysFile.deployedAbis[abiVersionHash].latestDeployedAddress;

        return new SolidityContract(connection, contractAddress, abiFile);
    }

    static connectAt(connection, contractName, _contractAddress) {
        const contractAddress = _contractAddress.toLowerCase();
        const networkId = connection.network.id;
        const deploysFile = this.getDeploysFile(networkId, contractName);
        let abiVersionHash;

        // TODO: do it nicer, i.e. break when found
        Object.entries(deploysFile.deployedAbis).forEach(([abiHash, entry]) => {
            if (entry.deployments[contractAddress]) {
                abiVersionHash = abiHash;
            }
        });

        if (!abiVersionHash) {
            if (networkId === 999 && deploysFile.latestAbiHash) {
                abiVersionHash = deploysFile.latestAbiHash;
                // for manual local testing we deploy a legacy token w/o truffle artificats from migration scripts
                console.debug(
                    `On test network, using latest ABI for (supposedly legacy) ${contractName} because couldn't find deployment info at address ${contractAddress} in ${
                        deploysFile._fileName
                    }`
                );
            } else {
                throw new Error(
                    `Couldn't find deployment info for ${contractName} at address ${contractAddress} in ${
                        deploysFile._fileName
                    }`
                );
            }
        }

        const abiFile = this.getAbiFile(contractName, abiVersionHash);

        return new SolidityContract(connection, contractAddress, abiFile);
    }

    /* NB: this is not in use atm, not tested */
    static connectLatestAbi(connection, contractName) {
        const deploysFile = this.getDeploysFile(connection.network.id, contractName);
        const abiVersionHash = deploysFile.latestAbiHash;
        const abiFile = this.getAbiFile(contractName, abiVersionHash);

        if (
            !deploysFile.deployedAbis[abiVersionHash] ||
            !deploysFile.deployedAbis[abiVersionHash].latestDeployedAddress
        ) {
            throw new Error(
                `Couldn't find deployment info for ${contractName} with latest abi version ${abiVersionHash} in ${
                    deploysFile._fileName
                }`
            );
        }
        const contractAddress = deploysFile.deployedAbis[abiVersionHash].latestDeployedAddress;

        if (
            !deploysFile.deployedAbis[abiVersionHash] ||
            !deploysFile.deployedAbis[abiVersionHash].latestDeployedAddress
        ) {
            throw new Error(
                `Couldn't find deployment info for ${contractName} with abi version ${abiVersionHash} in ${
                    deploysFile._fileName
                }`
            );
        }

        return new SolidityContract(connection, contractAddress, abiFile);
    }

    static getDeploysFile(networkId, contractName) {
        const deploysFileName = `abiniser/deployments/${networkId}/${contractName}_DEPLOYS.json`;
        let deploysFile;

        try {
            /* must provid fileName string again for webpack (needs to be statically analysable) */
            deploysFile = require(`abiniser/deployments/${networkId}/${contractName}_DEPLOYS.json`);
        } catch (error) {
            throw new Error(`Couldn't import deployment file ${deploysFileName} for ${contractName}\n${error}`);
        }
        deploysFile._fileName = deploysFileName;
        return deploysFile;
    }

    static getAbiFile(contractName, abiVersionHash) {
        const abiFileName = `abiniser/abis/${contractName}_ABI_${abiVersionHash}`;
        let abiFile;

        try {
            /* must provid fileName string again for webpack (needs to be statically analysable) */
            abiFile = require(`abiniser/abis/${contractName}_ABI_${abiVersionHash}`);
        } catch (error) {
            throw new Error(`Couldn't import abi file ${abiFileName} for ${contractName}\n${error}`);
        }
        abiFile._fileName = abiFileName;
        return abiFile;
    }
}
