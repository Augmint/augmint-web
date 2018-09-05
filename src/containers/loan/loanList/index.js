import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { Psegment, Pheader } from "components/PageLayout";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import Segment from "components/augmint-ui/segment";
import { Menu } from "components/augmint-ui/menu";
import Button from "components/augmint-ui/button";
import { ErrorPanel } from "components/MsgPanels";
import LoanCard from "./LoanCard";

function LoanList(props) {
    const { location } = props;
    const { isLoading, error, loans } = props.loans;
    const isActivePage = location.pathname === "/loan";

    const listItems =
        loans &&
        loans
            .filter(loan => loan.isRepayable === isActivePage)
            .map(loan => <LoanCard key={`loan-${loan.id}`} loan={loan} />);

    return (
        <Psegment>
            <TopNavTitlePortal>
                <Pheader header="My loans" />
            </TopNavTitlePortal>

            <Segment>
                <Menu>
                    <Menu.Item exact to="/loan" activeClassName="active">
                        My active loans
                    </Menu.Item>
                    <Menu.Item exact to="/loan/archive" activeClassName="active">
                        My old loans
                    </Menu.Item>
                    <Button style={{ marginLeft: "auto" }} content="Get a new loan" to="/loan/new" />
                </Menu>

                <div className={isLoading ? "loading" : ""}>
                    {error && <ErrorPanel header="Error while fetching loan list">{error.message}</ErrorPanel>}
                    {listItems && listItems.length === 0 ? <p>You have no loans.</p> : <div>{listItems}</div>}
                </div>
            </Segment>
        </Psegment>
    );
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    loans: state.loans
});

export default withRouter(connect(mapStateToProps)(LoanList));
