export function matchOrders(n, orders, direction, rate) {
    // buy n amount of aeurotoken for price at rate from orders
    let tokens = 0;
    let ethers = 0;
    let prices = { total: 0, list: [] };
    let index = 0;
    let remains = [];

    orders.forEach(i => {
        let amount = 0;
        if (tokens < n) {
            if (i.amount >= n + tokens) {
                amount = n;
                remains.push({ price: i.price, amount: i.amount - n });
            } else if (i.amount < n + tokens && n - tokens < i.amount) {
                amount = n - tokens;
                remains.push({ price: i.price, amount: i.amount - (n - tokens) });
            } else if (i.amount < n + tokens && n - tokens >= i.amount) {
                amount = i.amount;
                ethers += i.ethers;
            }
            tokens += amount;
            ethers += (i.ethers * amount) / i.amount;
            prices.total += i.price * amount;
            prices.list.push(i.price);
            index++;
        } else {
            remains.push({ price: i.price, amount: i.amount, ethers: i.ethers });
        }
    });

    tokens = parseFloat(tokens.toFixed(2));
    ethers = parseFloat(ethers.toFixed(5));

    const averagePrice = parseFloat((prices.total / tokens).toFixed(3));
    const limitPrice = direction === 0 ? Math.max(...prices.list) : Math.min(...prices.list);

    return {
        tokens,
        ethers,
        limitPrice,
        averagePrice
    };
}
