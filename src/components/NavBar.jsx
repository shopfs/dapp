import React from "react";
import { Link, withRouter } from "react-router-dom";
import ProfileHover from "profile-hover";
import { connect } from "react-redux";
import { web3Actions, boxActions } from "../actions";
import { history, getAccountString } from "../helpers";
import loading from "../assets/img/loading.svg";
import logo from "../assets/img/logo.svg";
import "../assets/scss/navBar.scss";

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pathname: this.props.location.pathname
        };
        this.connect = this.connect.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        if (props.location.pathname !== state.pathname) {
            return {
                pathname: props.location.pathname
            };
        }
        return null;
    }

    async connect() {
        await this.props.loadWeb3();
        if (this.state.pathname === "/") {
            history.push("/upload");
        }
        //3box commented for faster loading for now
        await this.props.loadbox(this.props.account);
    }

    render() {
        const { inProgress, account, connected } = this.props;
        const loginText = this.state.pathname === "/" ? "Try now" : "Sign In";
        return (
            <div className="navBarContainer">
                <div className="navBar">
                    <div className="navBarLeft">
                        <Link className="navBarLogo" to="/">
                            <img className="logo" src={logo} />
                        </Link>
                        <img
                            className="loading"
                            src={loading}
                            style={inProgress ? { opacity: 1 } : { opacity: 0 }}
                        />
                    </div>
                    <div className="navBarRight">
                        {connected && (
                            <>
                                <Link className="navLink" to="/upload">
                                    upload
                                </Link>
                            </>
                        )}
                        <Link className="navLink" to="/files">
                            explore
                        </Link>
                        <a
                            className="navLink"
                            href="https://shopfs-docs.web.app"
                        >
                            docs
                        </a>
                        <div className="navBarAddress">
                            {connected ? (
                                <div
                                    className="signInButton button"
                                    onClick={() => {
                                        history.push(`/users/${account}`);
                                    }}
                                >
                                    {getAccountString(account)}
                                </div>
                            ) : (
                                <a
                                    className="signInButton button"
                                    onClick={() => {
                                        this.connect();
                                    }}
                                >
                                    {loginText}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
function mapState(state) {
    const { account, connected } = state.web3;
    //const { loggedIn } = state.box;
    const inProgress =
        state.user.inProgress || state.box.inProgress || state.web3.inProgress;
    return { inProgress, account, connected };
}

const actionCreators = {
    loadWeb3: web3Actions.loadWeb3,
    loadbox: boxActions.loadbox
};

const connectedNavBar = withRouter(connect(mapState, actionCreators)(NavBar));
export default connectedNavBar;
