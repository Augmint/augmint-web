import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Pgrid, Psegment } from "components/PageLayout";
import LockForm from "../containers/LockForm";

import "./styles.css";

export const StyledButtonContainer = styled.div`
    display: flex;
    height: 100%;
    align-items: center;
`;

class NewLock extends React.Component {
    render() {
        const { lockManager, lockProducts } = this.props;

        return (
            <Psegment>
                <Pgrid className="new-lock">
                    <Pgrid.Row columns={1}>
                        <Pgrid.Column className="column" size={{ tablet: 1, desktop: 2 / 5 }}>
                            <LockForm lockManager={lockManager} lockProducts={lockProducts} />
                        </Pgrid.Column>
                    </Pgrid.Row>
                </Pgrid>
            </Psegment>
        );
    }
}

const mapStateToProps = state => {
    return {
        lockManager: state.lockManager,
        lockProducts: state.lockManager.products
    };
};

export default connect(mapStateToProps)(NewLock);
