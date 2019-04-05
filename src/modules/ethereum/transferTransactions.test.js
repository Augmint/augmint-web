import { calculateTransfersBalance, processTransferEvents } from "modules/ethereum/transferTransactions";
import { MAKEEVENTCONST, makeEventsFor } from "mocks/events";

const { LOAN, ALICE, BOB, CAROL, DELEGATED_MSG } = MAKEEVENTCONST;

describe("transfers", () => {
    test("ALICE gets a loan", () => {
        const aliceEvents = makeEventsFor(ALICE, [[1, LOAN, 100, ALICE, "", 0], [2, ALICE, 1, BOB]]);
        let transfers = processTransferEvents(aliceEvents, ALICE);
        expect(transfers.length).toBe(2);
        calculateTransfersBalance(transfers, 98.98 * 100);
        const lastItem = transfers.pop();
        expect(lastItem.balance).toBe(100 * 100);
    });
});

describe("delegated transfers", () => {
    test("ALICE -> BOB (CAROL)", () => {
        const aliceEvents = makeEventsFor(ALICE, [
            [1, LOAN, 100, ALICE],
            [2, ALICE, 1, BOB],
            [2, ALICE, 0.01, CAROL, DELEGATED_MSG, 0]
        ]);
        let transfers = processTransferEvents(aliceEvents, ALICE);
        expect(aliceEvents.length).toBe(3);
        expect(transfers.length).toBe(2);
        calculateTransfersBalance(transfers, 9897);
        const lastItem = transfers.pop();
        expect((lastItem.balance / 100).toFixed(2)).toBe((100).toFixed(2));
    });

    test("ALICE -> BOB (ALICE)", () => {
        const aliceEvents = makeEventsFor(ALICE, [
            [1, LOAN, 100, ALICE],
            [2, ALICE, 1, BOB],
            [2, ALICE, 0.01, ALICE, DELEGATED_MSG, 0]
        ]);
        let transfers = processTransferEvents(aliceEvents, ALICE);
        expect(aliceEvents.length).toBe(4);
        expect(transfers.length).toBe(2);
        calculateTransfersBalance(transfers, 9898);
        const lastItem = transfers.pop();
        expect((lastItem.balance / 100).toFixed(2)).toBe((100).toFixed(2));
    });

    test("ALICE -> BOB,  ALICE -> CAROL (fake narrative)", () => {
        const aliceEvents = makeEventsFor(ALICE, [
            [1, LOAN, 100, ALICE],
            [2, ALICE, 1, BOB],
            [3, ALICE, 1, CAROL, DELEGATED_MSG]
        ]);
        let transfers = processTransferEvents(aliceEvents, ALICE);
        expect(aliceEvents.length).toBe(3);
        expect(transfers.length).toBe(3);
        calculateTransfersBalance(transfers, 9796);
        const lastItem = transfers.pop();
        expect((lastItem.balance / 100).toFixed(2)).toBe((100).toFixed(2));
    });

    test("BOB -> CAROL (ALICE)", () => {
        const aliceEvents = makeEventsFor(ALICE, [
            [1, LOAN, 100, ALICE],
            [2, LOAN, 100, BOB],
            [3, BOB, 1, CAROL],
            [3, BOB, 0.01, ALICE, DELEGATED_MSG, 0]
        ]);
        let transfers = processTransferEvents(aliceEvents, ALICE);
        expect(aliceEvents.length).toBe(2);
        expect(transfers.length).toBe(2);
        calculateTransfersBalance(transfers, 10001);
        const lastItem = transfers.pop();
        expect((lastItem.balance / 100).toFixed(2)).toBe((100).toFixed(2));
    });
});
