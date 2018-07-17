import ReactDOM from "react-dom";

export default function TopNavTitlePortal(props) {
    return ReactDOM.createPortal(props.children, document.querySelector("#page-title"));
}
