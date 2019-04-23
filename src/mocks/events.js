export let FEE = 2;

export const MAKEEVENTCONST = {
    ALICE: "0x8d259efe1c7174939524986550365bb5e97f7ead",
    BOB: "0xb1e0d0ba41ff4d9dcb30c922d16dfa8598585344",
    CAROL: "0xe71e9636e31b838af0a3c38b3f3449cdc2b7aa87",
    LOCK: "0xc0b97fe5cad0d43d0c974c4e9a00312dc661f8ab",
    LOAN: "0x0000000000000000000000000000000000000000",
    DELEGATED_MSG: "Delegated transfer fee"
};

class AugmintTransferEvent {
    constructor(from, amount, to, narrative = "", blockNumber, fee = FEE) {
        this.returnValues = {
            from,
            to,
            amount: amount * 100,
            fee: fee,
            narrative
        };
        this.blockNumber = blockNumber;
        this.transactionHash = `hash-${this.blockNumber}`;
        this.transactionIndex = this.blockNubmer;
    }
}

export function makeEventsFor(account, transferList) {
    const eventList = transferList.map(
        transfer =>
            new AugmintTransferEvent(transfer[1], transfer[2], transfer[3], transfer[4], transfer[0], transfer[5])
    );

    return [].concat(
        eventList.filter(event => event.returnValues.from === account),
        eventList.filter(event => event.returnValues.to === account)
    );
}
