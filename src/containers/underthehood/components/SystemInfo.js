import React from "react";
import { Pblock } from "components/PageLayout";

export function SystemInfo(props) {
    return (
        <Pblock header="System info">
            <p>NODE_ENV: {process.env.NODE_ENV} </p>
            {/*netlify env variables, see: https://www.netlify.com/docs/continuous-deployment/#build-environment-variables */}
            <p>Netlify env variables:</p>
            REPOSITORY_URL: {process.env.REACT_APP_REPOSITORY_URL}
            <br />
            BRANCH: {process.env.REACT_APP_BRANCH}
            <br />
            PULL_REQUEST: {process.env.REACT_APP_PULL_REQUEST}
            <br />
            HEAD: {process.env.REACT_APP_HEAD}
            <br />
            COMMIT_REF: {process.env.REACT_APP_COMMIT_REF}
            <br />
            CONTEXT: {process.env.REACT_APP_CONTEXT}
            <br />
            REVIEW_ID: {process.env.REACT_APP_REVIEW_ID}
            <br />
            URL: {process.env.REACT_APP_URL}
            <br />
            DEPLOY_URL: {process.env.REACT_APP_DEPLOY_URL}
            <br />
            DEPLOY_PRIME_URL: {process.env.REACT_APP_DEPLOY_PRIME_URL}
            <br />
            NODE_VERSION: {process.env.REACT_APP_NODE_VERSION}
            <br />
            YARN_VERSION: {process.env.REACT_APP_YARN_VERSION}
            <br />
            YARN_FLAGS: {process.env.REACT_APP_YARN_FLAGS}
            <br />
            NPM_VERSION: {process.env.REACT_APP_NPM_VERSION}
            <br />
            NPM_FLAGS: {process.env.REACT_APP_NPM_FLAGS}
            <br />
        </Pblock>
    );
}
