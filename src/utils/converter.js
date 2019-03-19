export function shortAccountAddresConverter(address) {
    return address.substring(0, 6) + "..." + address.substring(address.length - 4, address.length);
}

export function floatNumberConverter(floatedNumber, decimals) {
    const _decimals = Math.pow(10, decimals);
    return Math.round(floatedNumber * _decimals * _decimals) / _decimals;
}

export function decimalNumberConverter(decimalNumber, decimals) {
    const _decimals = Math.pow(10, decimals);
    return decimalNumber / _decimals;
}
