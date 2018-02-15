import React from "react";
import { Pblock } from "components/PageLayout";

export function SystemInfo(props) {
    return (
        <Pblock header="System info">
            <p>NODE_ENV: {process.env.NODE_ENV} </p>

            {/*netlify env variables, see: https://www.netlify.com/docs/continuous-deployment/#build-environment-variables */}
            <p>Netlify env variables: </p>
            <ul>
                <li>
                    REPOSITORY_URL: {process.env.REPOSITORY_URL}
                    <br />URL to the Git repository the build pulls changes from.
                </li>
                <li>
                    BRANCH: {process.env.BRANCH}
                    <br />Reference to check out after fetching changes from the Git repository.
                </li>
                <li>
                    PULL_REQUEST: {process.env.PULL_REQUEST}
                    <br />Whether the build is from a pull request or not.
                </li>
                <li>
                    HEAD: {process.env.HEAD}
                    <br />Name of the head branch received from a Git provider.
                </li>
                <li>
                    COMMIT_REF: {process.env.COMMIT_REF}
                    <br />Reference of the commit we’re building.
                </li>
                <li>
                    CONTEXT: {process.env.CONTEXT}
                    <br />Name of the context a deploy is built around, it can be production, deploy-preview or
                    branch-deploy.
                </li>
                <li>
                    REVIEW_ID: {process.env.REVIEW_ID}
                    <br />the ID of the pull request and deploy preview (e.g. 1211). These two numbers will always match
                    (deploy-preview-12 is for PR # 12 in your repository)
                </li>
            </ul>
        </Pblock>
    );
}
