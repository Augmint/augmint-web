import store from "modules/store";
import BigNumber from "bignumber.js";
import { cost } from "./gas";
import { processTx } from "modules/ethereum/ethHelper";
import SolidityContract from "modules/ethereum/SolidityContract";
import { DECIMALS_DIV, LEGACY_AEUR_CONTRACTS } from "utils/constants";

export async function fetchLegacyBalances() {
    const web3 = store.getState().web3Connect;
    const legacyTokenAddresses = LEGACY_AEUR_CONTRACTS[web3.network.id];
    const userAccount = store.getState().web3Connect.userAccount;

    const queryTxs = legacyTokenAddresses.map(address => {
        const legacyContract = SolidityContract.connectAt(web3, "TokenAEur", address);
        return legacyContract.web3ContractInstance.methods.balanceOf(userAccount).call();
    });

    const legacyBalances = await Promise.all(queryTxs);
    const ret = legacyBalances.map((bn_balance, i) => ({
        contract: legacyTokenAddresses[i],
        bn_balance,
        balance: bn_balance / DECIMALS_DIV
    }));

    return ret;
}

export async function convertLegacyBalanceTx(legacyTokenAddress, amount) {
    const txName = "Convert legacy balance";
    const web3 = store.getState().web3Connect;
    const monetarySupervisorAddress = store.getState().contracts.latest.monetarySupervisor.address;
    const gasEstimate = cost.LEGACY_BALANCE_CONVERT_GAS;
    const userAccount = store.getState().web3Connect.userAccount;

    const legacyContract = SolidityContract.connectAt(web3, "TokenAEur", legacyTokenAddress);

    const tx = legacyContract.web3ContractInstance.methods
        .transferAndNotify(monetarySupervisorAddress, new BigNumber(amount).mul(DECIMALS_DIV).toString(), 0)
        .send({
            from: userAccount,
            gas: gasEstimate
        });

    const transactionHash = await processTx(tx, txName, gasEstimate);
    return { txName, transactionHash };
}
