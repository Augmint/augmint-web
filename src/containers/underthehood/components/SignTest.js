import React from "react";
import { Button } from "semantic-ui-react";
import { Pblock } from "components/PageLayout";

export function SignTest(props) {
    const { web3Instance, userAccount } = props.web3Connect;

    const handleSignClick = async e => {
        let signed = await web3Instance.eth.personal.sign(
            "Hello world",
            userAccount
        );
        alert(signed);
    };

    return (
        <Pblock header="Sign test">
            <Button size="small" onClick={handleSignClick}>
                Sign
            </Button>
        </Pblock>
    );
}
