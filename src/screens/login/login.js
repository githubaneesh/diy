import AuthService from '../../services/authservice';
import AuthServerService from '../../services/auth-server.service.js';
import CryptoHelper from "../../utility/cryptohelper";
import CookieService from "../../services/cookieservice";
import UserService from "../../services/userservice";
import RoutesUtility from '../../utility/routesutility';
import Event from "../../services/events/event";

class LoginController {
    _authService = AuthService.instance;
    _cookieService = CookieService.instance;
    _userService = UserService.instance;

    async login(postContent){
        return await AuthServerService.login(postContent);
    }

    async updatePolicy(postContent) {
        return await this._authService.updatePolicy(postContent);
    }

    async getToken(postContent) {
        return await this._userService.getUserDetails(null);
    }

    getLoggedInUser() {
        return this._cookieService.user;
    }
    
    saveUser(response) {
        this._cookieService.saveUser(response);
      }

}

export default LoginController;