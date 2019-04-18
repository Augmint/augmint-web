export function matchOrders(n, orders, direction) {
    // buy n amount of aeurotoken for price at rate from orders
    let tokens = 0;
    let ethers = 0;
    let prices = { total: 0, list: [] };
    let index = 0;

    let sorted;

    if (direction === 0) {
        sorted = orders.sort(sortOrders);

        sorted.forEach(i => {
            if (i.amount + tokens <= n) {
                tokens += i.amount;
                prices.total += i.price;
                prices.list.push(i.price);
                ethers += i.ethers;
                index++;
            } else {
                tokens += i.amount - (tokens - n);
            }
        });
    } else {
        sorted = orders.sort(sortOrders).reverse();

        sorted.forEach(i => {
            if (i.amount + tokens <= n) {
                tokens += i.amount;
                prices.total += i.price;
                prices.list.push(i.price);
                ethers += i.ethers;
                index++;
            } else {
                tokens += i.amount - (tokens - n);
            }
        });
    }

    const book = sorted.slice(index);

    tokens = parseFloat(tokens.toFixed(2));
    ethers = parseFloat(ethers.toFixed(5));

    const averagePrice = parseFloat((prices.total / prices.list.length).toFixed(3));
    const limitPrice = Math.max(...prices.list);

    return {
        tokens,
        ethers,
        limitPrice,
        averagePrice,
        book
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
