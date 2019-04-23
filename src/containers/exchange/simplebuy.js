export function matchOrders(n, orders, direction, rate) {
    // buy n amount of aeurotoken for price at rate from orders
    let tokens = 0;
    let ethers = 0;
    let prices = { total: 0, list: [] };
    let index = 0;
    let remains = [];

    let sorted = direction === 0 ? orders : orders.reverse();

    sorted.forEach(i => {
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
            }
            tokens += amount;
            prices.total += i.price * amount;
            prices.list.push(i.price);
            ethers += i.ethers;
            index++;
        } else {
            remains.push({ price: i.price, amount: i.amount, ethers: i.ethers });
        }
    });

    // to remain in the book, the rest will be erased
    let book = reCalcBook(sorted, remains, rate);

    tokens = parseFloat(tokens.toFixed(2));
    ethers = parseFloat(ethers.toFixed(5));

    const averagePrice = parseFloat((prices.total / tokens).toFixed(3));
    const limitPrice = direction === 0 ? Math.max(...prices.list) : Math.min(...prices.list);

    return {
        tokens,
        ethers,
        limitPrice,
        averagePrice,
        book
    };
}

function reCalcBook(orders, list, rate) {
    let prices = list.map(i => i.price);
    let book = [];

    orders.forEach(i => {
        if (prices.indexOf(i.price) >= 0) {
            let remainPair = list.find(item => item.price === i.price);

            i.amount = remainPair.amount;
            i.ethers = remainPair.ethers || (remainPair.amount * i.price) / rate;
            book.push(i);
        }
    });

    return book;
}
