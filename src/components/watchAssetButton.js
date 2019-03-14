import React from "react";
import { connect } from "react-redux";
import { watchAsset } from "modules/watchAsset.js";
import Button from "components/augmint-ui/button";
import { getCookie } from "utils/cookie.js";

export class WatchAssetButton extends React.Component {
    constructor(props) {
        super(props);
        this.addAsset = this.addAsset.bind(this);

        this.cookies = null;
        this.newCookie = null;
        this.value = null;
        this.state = {
            added: false
        };

        this.isAssetAdded = true;
        this.isMetamask = false;
        this.hasAugmint = false;
    }

    addAsset() {
        const address = this.props.contracts.latest.augmintToken.address;
        const provider = this.props.web3.web3Instance.currentProvider;
        watchAsset(address, this.props.augmint, provider, this.newCookie).then(res => {
            if (res) {
                this.setState({ added: true });
            }
        });
    }

    watchAssetCookie() {
        if (this.cookies) {
            let contains = this.cookies.filter(c => {
                let equal = true;
                Object.keys(c).forEach(key => {
                    if (c[key] !== this.value[key]) {
                        equal = false;
                    }
                });
                return equal;
            });

            if (!contains || !contains.length) {
                this.newCookie = [...this.cookies];
                this.newCookie.push(this.value);
                this.isAssetAdded = false;
            }
        } else {
            this.newCookie = [this.value];
            this.isAssetAdded = false;
        }
        return this.isAssetAdded;
    }

    render() {
        const { web3, contracts, augmint, user } = this.props;
        this.cookies = getCookie("watchAsset");
        let showButton = false;

        if (web3.isConnected && contracts.isConnected && augmint.isLoaded && !user.isLoading) {
            this.value = {
                tokenAddress: contracts.latest.augmintToken.address,
                network: web3.network.name,
                account: web3.userAccount
            };

            const metamask = web3.web3Instance.currentProvider._metamask;
            this.isMetamask = metamask ? metamask.isEnabled() : null;
            this.hasAugmint = user.account.tokenBalance > 0;

            this.watchAssetCookie();
            showButton = this.isMetamask && !this.isAssetAdded && this.hasAugmint;
        }

        return (
            <div style={{ textAlign: "center" }}>
                {showButton && !this.state.added && (
                    <Button
                        className="primary"
                        style={{ padding: "15px", marginTop: "40px" }}
                        onClick={() => {
                            this.addAsset();
                        }}
                    >
                        Add A€ asset to your wallet
                    </Button>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    augmint: state.augmintToken,
    web3: state.web3Connect,
    contracts: state.contracts,
    user: state.userBalances
});

export default connect(mapStateToProps)(WatchAssetButton);
