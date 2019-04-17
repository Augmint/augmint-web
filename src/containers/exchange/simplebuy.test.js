import { matchOrders } from "./simplebuy";

const rate = 142;

const buyerOrders = [
    {
        ether: 0.012,
        price: 0.91
    },
    {
        ether: 0.017,
        price: 0.9
    },
    {
        ether: 0.027,
        price: 0.85
    }
].map(i => {
    i.token = i.ether * rate * i.price;
    return i;
});

const sellerOrders = [
    {
        token: 1,
        price: 0.99
    },
    {
        token: 1.8,
        price: 0.96
    },
    {
        token: 1.2,
        price: 1
    }
].map(i => {
    i.ether = (i.token * i.price) / rate;
    return i;
});

describe("matching orders", () => {
    it("match toBuy AEUR", () => {
        const result = {
            tokens: 2.8,
            ethers: 0.01914,
            limitPrice: 0.99,
            averagePrice: 0.975
        };

        expect(matchOrders(3, sellerOrders)).toEqual(result);
    });

    it("match toSell AEUR", () => {
        const result = {
            tokens: 5.43,
            ethers: 0.044,
            limitPrice: 0.9,
            averagePrice: 0.875
        };

        expect(matchOrders(6, buyerOrders)).toEqual(result);
    });
});
