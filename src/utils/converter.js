export function shortAccountAddresConverter(address) {
    return address.substring(0, 3) + "..." + address.substring(address.length - 4, address.length);
}

export function floatNumberConverter(floatedNumber, decimals) {
    const numberArray = String(floatedNumber).split(".");
    numberArray[1] = numberArray[1] || "00000000000000000000000000000000000";
    return Number(numberArray[0] + numberArray[1].slice(0, decimals) + "." + numberArray[1].slice(decimals));

}
