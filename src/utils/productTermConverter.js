import moment from "moment";

export default function productTermConverter(termInSecs) {
    return moment.duration(termInSecs, "seconds").humanize();
}
