export function matchOrders(n, orders, direction) {
    // buy n amount of aeurotoken for price at rate from orders
    let tokens = 0;
    let ethers = 0;
    let prices = { total: 0, list: [] };
    let index = 0;

    let sorted = direction === 0 ? orders.sort(sortOrders) : orders.sort(sortOrders).reverse();

    sorted.forEach(i => {
        let amount = 0;
        if (tokens < n) {
            if (i.amount >= n + tokens) {
                amount = n;
            } else if (i.amount < n + tokens && n - tokens < i.amount) {
                amount = n - tokens;
            } else if (i.amount < n + tokens && n - tokens >= i.amount) {
                amount = i.amount;
            }
            tokens += amount;
            prices.total += i.price * amount;
            prices.list.push(i.price);
            ethers += i.ethers;
            index++;
        }
    });

    // const book = sorted.slice(index); // to remain in the book, the rest will be erased

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

function sortOrders(a, b) {
    if (a.price < b.price) {
        return -1;
    }

    if (b.price < a.price) {
        return 1;
    }

    return 0;
}
