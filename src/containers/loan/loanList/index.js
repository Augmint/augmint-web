import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { Psegment, Pheader } from "components/PageLayout";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import Segment from "components/augmint-ui/segment";
import { Menu } from "components/augmint-ui/menu";
import { NoItems } from "components/augmint-ui/list";
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
            .reverse()
            .filter(loan => loan.isRepayable === isActivePage)
            .map(loan => <LoanCard key={`loan-${loan.id}`} loan={loan} />);

    return (
        <Psegment>
            <TopNavTitlePortal>
                <Pheader header="My loans" />
            </TopNavTitlePortal>

            <Segment className="block">
                <Menu>
                    <Menu.Item exact to="/loan" activeClassName="active">
                        My active loans
                    </Menu.Item>
                    <Menu.Item exact to="/loan/archive" activeClassName="active">
                        My old loans
                    </Menu.Item>
                    <Button
                        style={{ marginLeft: "auto" }}
                        content="Get a new loan"
                        to="/loan/new"
                        data-testid="newLoanLink"
                    />
                </Menu>

                <div className={isLoading ? "loading" : ""}>
                    {error && <ErrorPanel header="Error while fetching loan list">{error.message}</ErrorPanel>}
                    {listItems && listItems.length === 0 ? (
                        <div style={{ textAlign: "center" }}>
                            <NoItems>{isActivePage ? "You have no active loans." : "You have no old loans."}</NoItems>
                            <Button content="Get a new loan" to="/loan/new" data-testid="newLoanLink" />
                        </div>
                    ) : (
                        <div>{listItems}</div>
                    )}
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
