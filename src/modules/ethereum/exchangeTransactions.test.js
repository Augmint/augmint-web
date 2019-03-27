import { isOrderBetter, TOKEN_BUY, TOKEN_SELL } from "modules/ethereum/exchangeTransactions";

describe("isOrderBetter", () => {
    test("o2 should be better (SELL price)", () => {
        const o1 = { direction: TOKEN_SELL, price: 2, id: 1 };
        const o2 = { direction: TOKEN_SELL, price: 1, id: 2 };
        const result = isOrderBetter(o1, o2);
        expect(result).toBe(1);
    });

    test("o1 should be better (BUY price)", () => {
        const o1 = { direction: TOKEN_BUY, price: 2, id: 2 };
        const o2 = { direction: TOKEN_BUY, price: 1, id: 1 };
        const result = isOrderBetter(o1, o2);
        expect(result).toBe(-1);
    });

    test("o2 should be better (SELL id)", () => {
        const o1 = { direction: TOKEN_SELL, price: 1, id: 2 };
        const o2 = { direction: TOKEN_SELL, price: 1, id: 1 };
        const result = isOrderBetter(o1, o2);
        expect(result).toBe(1);
    });

    test("o2 should be better (BUY id)", () => {
        const o1 = { direction: TOKEN_BUY, price: 1, id: 2 };
        const o2 = { direction: TOKEN_BUY, price: 1, id: 1 };
        const result = isOrderBetter(o1, o2);
        expect(result).toBe(1);
    });

    test("o1 should be better when o1 same as o2", () => {
        // same id for two orders, it shouldn't happen
        const o1 = { direction: TOKEN_SELL, price: 1, id: 1 };
        const o2 = { direction: TOKEN_SELL, price: 1, id: 1 };
        const result = isOrderBetter(o1, o2);
        expect(result).toBe(-1);
    });

    test("the direction of the two orders should be same", () => {
        const o1 = { direction: TOKEN_SELL, price: 2, id: 2 };
        const o2 = { direction: TOKEN_BUY, price: 1, id: 1 };
        try {
            isOrderBetter(o1, o2);
        } catch (e) {
            expect(e).not.toBeUndefined();
        }
    });
});
