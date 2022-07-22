import React, { Component } from 'react';
import './App.scss';
import Utils from "./utility/Utility";
import CryptoHelper from "./utility/cryptohelper";
import AuthServerService from "./services/auth-server.service";
import AuthService from "./services/authservice";
import CookieService from "./services/cookieservice";
import RoutesUtility from "./utility/routesutility";
import UserType from './common/userType';
import NotifierService from './services/notifierService';
import { Messages } from './utility/Messages';
import Event from './services/events/event';
const _authService = AuthService.instance;
const _cookieService = CookieService.instance;
const _notifierService = NotifierService.instance;

class App extends Component {
  constructor(props) {
    super(props);

    this.navigateRoute = this.navigateRoute.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.init();
    }

  }

  logout() {
    _cookieService.clearAll();
    CookieService.dispatchEvent(new Event(_cookieService.USER_LOGIN_STATUS, "user logged out."));
    this.props.history.push(RoutesUtility.LOGIN());
    _notifierService.showMessage({error:true}, '', Messages.authentication_failed);
}

  async navigateRoute() {
    const user = await _cookieService.getUser();
    const { history, location } = this.props;
    if (user && user._id) {
      if(user.userType.toLowerCase() === UserType.PROSPECT || user.userType.toLowerCase() === UserType.RECRUITER) {
        const routeUrl = RoutesUtility.SETTINGS();
        history.push(routeUrl);
      }
      else if(user.userType.toLowerCase() !== UserType.ADMIN) {
        // if user type is client / client admin / moderator
        if(location.pathname.toLowerCase().indexOf('/users/') !== -1) {
          this.logout();
        }
      }
      else {
        const routeUrl = (location && location.pathname && location.pathname !== "/") ? location.pathname : RoutesUtility.STUDIES();
        history.push(location.search ? routeUrl + location.search : routeUrl);
      }
    }
    else {
      if (location.pathname !== RoutesUtility.RESET_PASSWORD()) {
        history.push(RoutesUtility.LOGIN());
      }
    }
  }

  async init () {
    const { history } = this.props;
    if(this.props.location.search) {
      const queryObj = await Utils.getQueryObj(this.props.location.search);
      if(queryObj.t) {
        return await this.validateQueryObjectWithToken(queryObj.t)
      }
    }
    return this.navigateRoute();
  }

  async validateQueryObjectWithToken(queryObj) {
    try {
      const decryptObj = CryptoHelper.decrypt(queryObj, process.env.REACT_APP_NONCE);
      if (decryptObj.error) {
        return null;
      }
      const tokenValidateRes = await AuthServerService.updateRefreshToken(decryptObj.decryptedData.token, true);
      if (!tokenValidateRes) {
        history.push(RoutesUtility.LOGIN());
        // return;
      }
      console.log(tokenValidateRes.body);
      const saveUserRes = await _cookieService.saveUser(tokenValidateRes.body);
      const { history } = this.props;
      history.index = -1;
      console.log("decryptObj",decryptObj)
      if(decryptObj && decryptObj.decryptedData && decryptObj.decryptedData.redirectTo) {
        history.push(decryptObj.decryptedData.redirectTo);
      }
      else {
        history.push(RoutesUtility.STUDIES());
      }

    } catch (e) {
        console.log(e);
    }
  }

  render () {
    return (
      null
    )
  }
}

export default App;