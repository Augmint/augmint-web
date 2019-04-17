export function matchOrders(n, orders) {
    // buy n amount of aeurotoken for price at rate from orders
    let tokens = 0;
    let ethers = 0;
    let prices = { total: 0, list: [] };

    const sorted = orders.sort(sortOrders);

    sorted.forEach(i => {
        if (i.token + tokens <= n) {
            tokens += i.token;
            prices.total += i.price;
            prices.list.push(i.price);
            ethers += i.ether;
        }
    });

    tokens = parseFloat(tokens.toFixed(2));
    ethers = parseFloat(ethers.toFixed(5));

    const averagePrice = prices.total / prices.list.length;
    const limitPrice = Math.max(...prices.list);

    return {
        tokens,
        ethers,
        limitPrice,
        averagePrice
    };
}

function sortOrders(a, b) {
    if (a.price < b.price) {
        return -1;
    }

    if (b.price < a.price) {
        return 1;
    }

    return 0;
}
