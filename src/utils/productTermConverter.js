import moment from "moment";

export default function productTermConverter(termInSecs) {
    let res = moment.duration(termInSecs, "seconds").humanize();
    return res;
}
