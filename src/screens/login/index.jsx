import React, { Component } from 'react';
import { Link } from "react-router-dom";
import './style.scss';
import Utility from '../../utility/Utility';
import NotifierService from '../../services/notifierService';
import AuthServerService from '../../services/auth-server.service';
import { Messages } from '../../utility/Messages';
import LoginController from './login';
import RoutesUtility from '../../utility/routesutility';
import DialogModal from '../widgets/dialog-modal';
import PrivacyPolicy from './privacy-policy';
import UserType from '../../common/userType';
import Loader from '../widgets/loader';
import CookieService from '../../services/cookieservice';

const _cookieService = CookieService.instance;

class Login extends Component {
    email = undefined;
    password = undefined;
    _notificationService = NotifierService.instance;
    _controller = new LoginController();
    constructor() {
        super();

        this.state = {
            invalid: false,
            showPrivacy: false,
            showPrivacyLoader: false,
            logging: false
        }

        this.renderPrivacyPolicyDialog = this.renderPrivacyPolicyDialog.bind(this);
        this.closePrivacyDialog = this.closePrivacyDialog.bind(this);
        this.agreeButtonClick = this.agreeButtonClick.bind(this);
    }

    componentDidMount() {
        const user = this._controller.getLoggedInUser();
        if(user && user._id !== "" && user.token !== "" && AuthServerService.refresh_token) {
            const { history } = this.props;
            history.push(RoutesUtility.STUDIES());
        }
        else {
            _cookieService.clearAll();
            this.setState({logging: false});
        }
    }

    onLoginClick=async()=> {
        if(this.state.logging){
            return;
        }
        this.setState({logging: true});
        if (Utility.isValidText(this.email) && Utility.isValidText(this.password)) {
            const resp = await this._controller.login({ email: this.email, password: this.password });
            if (!resp || resp.error) {
                this.setState({logging: false});
                this._notificationService.showMessage({ error: true }, '', Messages.invalid_credentials);
                return;
            }
            if (resp && resp.body) {
                const userPolicyData = resp.body;
                if (userPolicyData && !userPolicyData.pp_accepted) {
                    this.setState({ showPrivacy: true });
                }
                else {
                    const response = await this._controller.getToken({ grant_type: 'password', email: this.email, password: this.password });
                    if (response) {
                        this._controller.saveUser(response.body);
                        const user = response.body;
                        const { history } = this.props;
                        if(user && user.userType && (user.userType.toLowerCase() === UserType.PROSPECT || user.userType.toLowerCase() === UserType.RECRUITER)) {
                            history.push(RoutesUtility.SETTINGS());
                        }
                        else {
                            history.push(RoutesUtility.STUDIES());
                        }  
                    }
                }
            }
        }
        else {
            this.setState({logging: false});
            this._notificationService.showMessage({error:true}, '', Messages.invalid_credentials);
        }
    }
    
    onEmailChange=(event)=> {
        this.email = event.target.value;

    }
    onPasswordChange=(event)=> {
        this.password = event.target.value;
    }

    renderPrivacyPolicyDialog() {
        return(
            <DialogModal showModal={this.state.showPrivacy} modalCloseHandler={this.closePrivacyDialog} refresh={this.state.showPrivacyLoader}>
                <PrivacyPolicy showLoader={this.state.showPrivacyLoader} handleAgreeClick={this.agreeButtonClick} />
            </DialogModal>
        );
    }

    async agreeButtonClick() {
        this.setState({showPrivacyLoader: true}, async()=>{
            await this._controller.updatePolicy({email: this.email, password: this.password, pp_accepted: true});
            const response = await this._controller.getToken({ grant_type: 'password', email: this.email, password: this.password });
            if (response) {
                this._controller.saveUser(response.body);
                this.closePrivacyDialog();
                const user = response.user;
                const { history } = this.props;
                if(user && user.userType && (user.userType.toLowerCase() === UserType.PROSPECT || user.userType.toLowerCase() === UserType.RECRUITER)) {
                    history.push(RoutesUtility.SETTINGS());
                }
                else {
                    history.push(RoutesUtility.STUDIES());
                }
            }
        });
    }

    closePrivacyDialog() {
        this.setState({showPrivacy: false, showPrivacyLoader: false});
    }

    render() {
        return (
            <div className="login">
                <div className="breadcumbs">Login</div>
                <div className="login-inner">
                    <div className="welcome-text">
                        <div className="title">Welcome</div>
                        <p className="lead">Welcome to LookLook®! Get ready to see the world of your consumers through new eyes. This tool allows us to conduct deep-dive ethnographic research with people right on their smartphones. In your commissioned study, this is the place you can log on to see the data as it is emerging. Every participant interacts with us one-on-one for maximum intimacy and genuine, fun (and telling!) conversation. We share photos and videos back and forth with each participant; and in so doing, illuminate findings that have never been possible with traditional research methodologies. Welcome to LookLook®!</p>
                    </div>
                    <div className="separator"></div>
                    <div className="login-inputs">
                        <div className="title">Login</div>
                        <label className="label">Email</label>
                        <input type="email" className="email" onChange={this.onEmailChange} required></input>
                        <label className="label">Password</label>
                        <input type="password" className="password" onChange={this.onPasswordChange} required></input>
                        {/* <Link to={"/studies"}>Log In</Link> */}
                        <div className="forgot-password"><Link to={"/reset-password"}>Forgot Password</Link></div>
                    </div>
                    <div className="login-button-container">
                        <button className="button" onClick={this.onLoginClick}>Login</button>
                        <div className="loader">
                        {this.state.logging && <Loader></Loader>}
                        </div>
                        
                    </div>
                </div>
                {this.renderPrivacyPolicyDialog()}
            </div>
        );
    }
}

export default Login;