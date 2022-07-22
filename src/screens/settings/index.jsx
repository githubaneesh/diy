import React, { Component } from 'react';
import CookieService from '../../services/cookieservice';
import SettingsController from './settings';
import RoutesUtility from '../../utility/routesutility';
import "./style.scss";
import Event from '../../services/events/event';

const _cookieService = CookieService.instance;
class Settings extends Component {
    user;
    userData;
    _controller;
    constructor(props){
        super(props);
        this.state = {
            userData: {},
            password: null
        }
        this.passwordChange = this.passwordChange.bind(this);
        this.handleSaveClick = this.handleSaveClick.bind(this);
        this.user = _cookieService.user;
        this._controller = new SettingsController();
    }

    passwordChange(event) {
        const passwordValue = event.target.value;        
        this.setState({password: passwordValue});
    }

    async handleSaveClick() {
        if (this.user && this.user._id) {
            const response = await this._controller.updateUserPassword(this.state.password, this.user._id);
            if (response && response.body) {
                this.logout();
            }
        }
        else {
            this.logout();
        }
    }

    logout = ()=>{
        this._controller.clearUserData();
        CookieService.dispatchEvent(new Event(_cookieService.USER_LOGIN_STATUS, "user logged out."));
        const { history } = this.props;
        history.push(RoutesUtility.LOGIN());
        
    }

    async componentDidMount(){
        if (this.user && this.user._id) {
            const userResponse = await this._controller.getUserDetails(null);
            if(userResponse && userResponse.body){
                this.setState({userData: userResponse.body})
            }
        }
        else {
            // For Now Handled in Page Level redirection need to handle in app.jsx
            const { history } = this.props;
            history.push(RoutesUtility.LOGIN());
        }
    }

    render() {
        
        return (
            <div className="settings-container">
                <div className="breadcumbs">Settings</div>
                <div className="container">
                    <div className="title">Settings</div>
                    <div className="spacing">
                        <label className="label">Email</label><br/>
                        <span> {this.state.userData.email} </span>
                    </div>
                    
                    <div className="password-input">
                        <label className="label">Update Password</label>
                        <input type="password" onChange={this.passwordChange} />
                    </div>

                    <div className="btn-container">   
                        <button className="button" disabled={!this.state.password} onClick={this.handleSaveClick}>Save</button>
                        <button className="button logout" onClick={this.logout}>Logout</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Settings;