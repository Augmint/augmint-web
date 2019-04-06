// import store from "modules/store";

// export const PAYEE_ETH_BALANCE_REQUESTED = "payeeEthBalance/ETH_BALANCE_REQUESTED";
// export const PAYEE_ETH_BALANCE_RECEIVED = "payeeEthBalance/ETH_BALANCE_RECEIVED";
// export const PAYEE_ETH_BALANCE_ERROR = "payeetEthBalance/ETH_BALANCE_ERROR";

// const initialState = {
//     isLoading: false,
//     isLoaded: false,
//     error: null,
//     payeeBalance: {
//         address: "?",
//         ethBalance: "?",
//         bn_ethBalance: null
//     }
// };

// export default (state = initialState, action) => {
//     switch (action.type) {
//         case PAYEE_ETH_BALANCE_REQUESTED:
//             return {
//                 ...state,
//                 isLoading: true,
//                 payeeBalance: action.address
//             };

//         case PAYEE_ETH_BALANCE_RECEIVED:
//             return {
//                 ...state,
//                 isLoading: false,
//                 isLoaded: true,
//                 payeeBalance: action.payeeBalance
//             };
//         case PAYEE_ETH_BALANCE_ERROR:
//             return {
//                 ...state,
//                 isLoading: false,
//                 error: action.error
//             };

//         default:
//             return state;
//     }
// };

// export const refreshPayeesEthBalance = payeeAddress => {
//     return async dispatch => {
//         dispatch({
//             type: PAYEE_ETH_BALANCE_REQUESTED,
//             address: payeeAddress
//         });
//         try {
//             const payeeBalance = await getPayeesEthBalance(payeeAddress);

//             return dispatch({
//                 type: PAYEE_ETH_BALANCE_RECEIVED,
//                 payeeBalance
//             });
//         } catch (error) {
//             if (process.env.NODE_ENV !== "production") {
//                 return Promise.reject(error);
//             }
//             return dispatch({
//                 type: PAYEE_ETH_BALANCE_ERROR,
//                 error
//             });
//         }
//     };
// };

// async function getPayeesEthBalance(payeeAddress) {
//     const web3 = store.getState().web3Connect.web3Instance;

//     const bn_weiBalance = await web3.eth.getBalance(payeeAddress);

//     return {
//         bn_ethBalance: bn_weiBalance,
//         ethBalance: web3.utils.fromWei(bn_weiBalance)
//     };
// }
