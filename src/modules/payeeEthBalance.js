import store from "modules/store";

export async function getPayeesEthBalance(payeeAddress) {
    const web3 = store.getState().web3Connect.web3Instance;

    try {
        const bn_weiBalance = await web3.eth.getBalance(payeeAddress);
        return {
            bn_ethBalance: bn_weiBalance,
            ethBalance: web3.utils.fromWei(bn_weiBalance)
        };
    } catch (error) {
        return {
            error
        };
    }
}
