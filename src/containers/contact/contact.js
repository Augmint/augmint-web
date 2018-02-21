import React from "react";

export default class Contact extends React.Component {
    componentDidMount() {
        this._updateIframe();
    }

    componentDidUpdate() {
        this._updateIframe();
    }
    _updateIframe() {
        const iframe = this.refs.iframe;
        const document = iframe.contentDocument;
        const script = document.createElement("script");

        script.src = "https://r3.minicrm.hu/api/loader.js?20916-1ltpzoohjm2iaaaagjn9";
        script.async = true;

        document.body.appendChild(script);
    }
    render() {
        return (
          <iframe id="contact-us" title="Contact us" ref="iframe" frameBorder={'0'} width={'100%'} height={'100%'} style={{ minHeight: 500 }}/>
        )
    }
}
