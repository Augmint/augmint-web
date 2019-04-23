import { matchOrders } from "./simplebuy";

const rate = 142;

const buyerOrders = [
    {
        ethers: 0.012,
        price: 0.91
    },
    {
        ethers: 0.017,
        price: 0.9
    },
    {
        ethers: 0.027,
        price: 0.85
    }
].map(i => {
    i.amount = i.ethers * rate * i.price;
    return i;
});

const sellerOrders = [
    {
        amount: 1,
        price: 0.99
    },
    {
        amount: 1.8,
        price: 0.96
    },
    {
        amount: 1.2,
        price: 1
    }
].map(i => {
    i.ethers = (i.amount * i.price) / rate;
    return i;
});

describe("matching orders", () => {
    it("match toBuy AEUR", () => {
        const result = {
            tokens: 3,
            ethers: 0.02759,
            limitPrice: 0.96,
            averagePrice: 0.975
        };

        expect(matchOrders(3, sellerOrders, 0)).toEqual(result);
    });

    it("match toSell AEUR", () => {
        const result = {
            tokens: 2,
            ethers: 0.029,
            limitPrice: 1,
            averagePrice: 0.973
        };

        expect(matchOrders(2, buyerOrders, 1)).toEqual(result);
    });
});
