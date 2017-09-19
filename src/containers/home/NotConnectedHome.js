import React from "react";
import { Hero } from "./Hero";
import { DcmOverview } from "./DcmOverview";
import { ProjectStatus } from "./ProjectStatus";

export default class NotConnectedHome extends React.Component {
    render() {
        return (
            <div>
                <Hero />
                <DcmOverview />
                <ProjectStatus />
            </div>
        );
    }
}
