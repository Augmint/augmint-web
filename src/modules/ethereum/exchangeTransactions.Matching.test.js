import { calculateMatchingOrders } from "modules/ethereum/exchangeTransactions";
import BigNumber from "bignumber.js";
import { cost } from "./gas";

describe("getMatchingOrders", () => {
    const ETHEUR_RATE = new BigNumber(500);
    const BN_ONE = new BigNumber(1);
    const GAS_LIMIT = Number.MAX_SAFE_INTEGER;

    test("should return no match if no orders", () => {
        const [buyIds, sellIds] = calculateMatchingOrders([], [], ETHEUR_RATE, GAS_LIMIT);
        expect(sellIds).toHaveLength(0);
        expect(buyIds).toHaveLength(0);
    });

    test("should return empty arrays if no matching orders", () => {
        const buyOrders = [
            { id: 2, price: 0.9999, bn_ethAmount: BN_ONE },
            { id: 3, price: 0.97, bn_ethAmount: BN_ONE },
            { id: 1, price: 0.9, bn_ethAmount: BN_ONE }
        ];
        const sellOrders = [
            { id: 4, price: 1, amount: 10 }, //
            { id: 5, price: 1.01, amount: 10 } //
        ];

        const matches = calculateMatchingOrders(buyOrders, sellOrders, ETHEUR_RATE, GAS_LIMIT);

        expect(matches.buyIds).toHaveLength(0);
        expect(matches.sellIds).toHaveLength(0);
        expect(matches.gasEstimate).toBe(0);
    });

    test("should return matching orders (two matching)", () => {
        const buyOrders = [
            { id: 2, price: 1, bn_ethAmount: BN_ONE },
            { id: 3, price: 0.97, bn_ethAmount: BN_ONE },
            { id: 1, price: 0.9, bn_ethAmount: BN_ONE }
        ];
        const sellOrders = [
            { id: 4, price: 1, amount: 10 }, //
            { id: 5, price: 1.05, amount: 10 } //
        ];

        const matches = calculateMatchingOrders(buyOrders, sellOrders, ETHEUR_RATE, GAS_LIMIT);

        expect(matches.buyIds).toEqual([2]);
        expect(matches.sellIds).toEqual([4]);
        expect(matches.gasEstimate).toBe(cost.MATCH_MULTIPLE_FIRST_MATCH_GAS);
    });

    test("should return matching orders (1 buy filled w/ 2 sells)", () => {
        const buyOrders = [
            { id: 2, price: 1.1, bn_ethAmount: BN_ONE }, // maker. tokenValue = 1ETH x 500 ETHEUER / 1.1 = 454.55AEUR
            { id: 3, price: 0.97, bn_ethAmount: BN_ONE },
            { id: 1, price: 0.9, bn_ethAmount: BN_ONE }
        ];
        const sellOrders = [
            { id: 4, price: 1.05, amount: 400 }, // fully filled from id 2
            { id: 5, price: 1.04, amount: 54.55 }, // fully filled from id 2 and no leftover in id 2
            { id: 6, price: 1.04, amount: 10 } // no fill...
        ];

        const matches = calculateMatchingOrders(buyOrders, sellOrders, ETHEUR_RATE, GAS_LIMIT);

        expect(matches.buyIds).toEqual([2, 2]);
        expect(matches.sellIds).toEqual([4, 5]);
        expect(matches.gasEstimate).toBe(
            cost.MATCH_MULTIPLE_FIRST_MATCH_GAS + cost.MATCH_MULTIPLE_ADDITIONAL_MATCH_GAS
        );
    });

    test("should return matching orders (2 buys filled w/ 3 sells)", () => {
        const buyOrders = [
            { id: 11, price: 1.1, bn_ethAmount: new BigNumber(0.659715) }, // fully filled with id 9 as taker
            { id: 3, price: 1.09, bn_ethAmount: BN_ONE }, // partially filled from id 4 as maker (leftover 0.9854812) and fully filled from id 2 as taker
            { id: 5, price: 0.9, bn_ethAmount: BN_ONE } // no fill (not matched)
        ];

        const sellOrders = [
            { id: 9, price: 1.05, amount: 314.15 }, // maker. ethValue = 314.15 / 500 ETHEUR * 1.05 = 0.659715 ETH
            { id: 4, price: 1.06, amount: 6.66 }, // taker in match with id 3, so ethValue = 6.66 / 500 ETHEUR * 1.09 (maker price) = 0.0145188 ETH
            { id: 2, price: 1.07, amount: 460.51 }, // maker in match with id 3 (full fill) ethValue = 0.9854812
            { id: 6, price: 1.08, amount: 10 } // no matching because no more left in matching buy orders..
        ];

        const matches = calculateMatchingOrders(buyOrders, sellOrders, ETHEUR_RATE, GAS_LIMIT);

        expect(matches.buyIds).toEqual([11, 3, 3]);
        expect(matches.sellIds).toEqual([9, 4, 2]);
        expect(matches.gasEstimate).toBe(
            cost.MATCH_MULTIPLE_FIRST_MATCH_GAS + 2 * cost.MATCH_MULTIPLE_ADDITIONAL_MATCH_GAS
        );
    });

    test("should return as many matches as fits to gasLimit passed (exact)", () => {
        const buyOrders = [
            { id: 1, price: 1, bn_ethAmount: BN_ONE },
            { id: 2, price: 1, bn_ethAmount: BN_ONE },
            { id: 3, price: 1, bn_ethAmount: BN_ONE }
        ];

        const sellOrders = [
            { id: 5, price: 1, amount: 500 },
            { id: 6, price: 1, amount: 500 },
            { id: 7, price: 1, amount: 500 }
        ];

        const gasLimit = cost.MATCH_MULTIPLE_FIRST_MATCH_GAS + cost.MATCH_MULTIPLE_ADDITIONAL_MATCH_GAS;

        const matches = calculateMatchingOrders(buyOrders, sellOrders, ETHEUR_RATE, gasLimit);

        expect(matches.buyIds).toEqual([1, 2]);
        expect(matches.sellIds).toEqual([5, 6]);
        expect(matches.gasEstimate).toBe(gasLimit);
    });

    test("should return as many matches as fits to gasLimit passed (almost)", () => {
        const buyOrders = [
            { id: 1, price: 1, bn_ethAmount: BN_ONE },
            { id: 2, price: 1, bn_ethAmount: BN_ONE },
            { id: 3, price: 1, bn_ethAmount: BN_ONE }
        ];

        const sellOrders = [
            { id: 5, price: 1, amount: 500 },
            { id: 6, price: 1, amount: 500 },
            { id: 7, price: 1, amount: 500 }
        ];

        const gasLimit = cost.MATCH_MULTIPLE_FIRST_MATCH_GAS + 2 * cost.MATCH_MULTIPLE_ADDITIONAL_MATCH_GAS - 1;

        const matches = calculateMatchingOrders(buyOrders, sellOrders, ETHEUR_RATE, gasLimit);

        expect(matches.buyIds).toEqual([1, 2]);
        expect(matches.sellIds).toEqual([5, 6]);
        expect(matches.gasEstimate).toBe(
            cost.MATCH_MULTIPLE_FIRST_MATCH_GAS + cost.MATCH_MULTIPLE_ADDITIONAL_MATCH_GAS
        );
    });
});
