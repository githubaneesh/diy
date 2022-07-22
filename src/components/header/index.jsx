import React, { Component } from 'react';
import './style.scss';
import DisplayImage from '../../screens/widgets/display-image';
import CookieService from "../../services/cookieservice";
import CryptoHelper from "../../utility/cryptohelper";
import { Link } from "react-router-dom";
import UserType from '../../common/userType';
import AuthServerService from '../../services/auth-server.service'

const _cookieService = CookieService.instance;
class Header extends Component {
    user;
    constructor(props) {
        super(props);
        this.state = {
            refresh: false
        }

        this.user = _cookieService.user;
        this.backToCms = this.backToCms.bind(this);
        this.openAnalysisTool = this.openAnalysisTool.bind(this);
        CookieService.addEventListener(_cookieService.USER_LOGIN_STATUS, this.handleData);
    }

    handleData = (userStatus)=>{
        console.log("userStatus: ", userStatus);
        this.user = _cookieService.user;
        this.setState({refresh: !this.state.refresh});
    }
    
    async backToCms(path){
		if(this.user){
			const token = AuthServerService.refresh_token;
            const encryptedString = CryptoHelper.encrypt({token, redirectTo: path}, process.env.REACT_APP_NONCE);
            window.location.href = `${process.env.REACT_APP_API_CMS}auth${token?'?t='+encryptedString : ''}`;
		}
    }
    async openAnalysisTool() {
        if(this.user){
			const token = AuthServerService.refresh_token;
            const encryptedString = CryptoHelper.encrypt({token}, process.env.REACT_APP_NONCE);
            // window.location.href = `${process.env.REACT_APP_AT_LINK}${encryptedString?'?t='+encryptedString : ''}`;
            window.open(`${process.env.REACT_APP_AT_LINK}${encryptedString?'?t='+encryptedString : ''}`, "_blank");
		}
    }

    render() {
        return (
            <div className="row header">
                <div className="header-inner">
                    <div className="logo">
                        <img src={require("../../assets/logo.png")}></img>
                    </div>
                    <div className="links">
                        {
                            (this.user && this.user._id && this.user.userType) ?
                                <div>
                                {
                                    (this.user.userType.trim().toLowerCase() === UserType.CLIENT 
                                        || this.user.userType.trim().toLowerCase() === UserType.MODERATOR
                                        || this.user.userType.trim().toLowerCase() === UserType.CLIENT_ADMINISTRATOR)
                                     ? <div className="nav">
                                        <button onClick={() => this.openAnalysisTool()}>Analysis Tool</button>
                                        <Link to={"/studies"}>All Studies</Link>
                                        <Link to={"/settings"}>My Settings</Link>                            
                                        </div>
                                    : (this.user.userType.trim().toLowerCase() === UserType.ADMIN)
                                        ? <div className="nav">
                                                <button onClick={() => this.openAnalysisTool()}>Analysis Tool</button>
                                                <Link to={"/studies"}>Study Directory</Link>
                                                <Link to={"/users/list/prospect"}>Prospect Directory</Link>
                                                <Link to={"/users/list/all"}>Account Directory</Link>
                                                <Link to={"/settings"}>My Settings</Link>
                                            </div>
                                        : <div className="nav">
                                                <Link to={"/settings"}>My Settings</Link>                            
                                            </div>
                                }
                                </div>
                            :<div className="nav"><Link to={"/login"}>Login</Link></div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Header;