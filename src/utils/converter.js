export function shortAccountAddresConverter(address) {
    return address.substring(0, 3) + "..." + address.substring(address.length - 4, address.length);
}
