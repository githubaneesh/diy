import UserModel from "../models/user";
import cookie from 'react-cookies';
import EventDispatcher from "./events/eventdispatcher";
import Event from "./events/event";
import AuthServerService from './auth-server.service';
const USER_COOKIE_PATH: string = "/";
let _singleton: boolean = true;
let _instance: CookieService;

class CookieService extends EventDispatcher {
    USER_LOGIN_STATUS = "user_login_status";
    token;
    constructor(){
        super();
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use SessionService.instance instead!');
        }
        // console.log(cookie.loadAll());       
    }

    static get instance(): CookieService{
        if (!_instance) {
            _singleton = false;
            _instance = new CookieService();
            _singleton = true;
        }
        return _instance;
    }

    async saveUser(user: UserModel) {
        await AuthServerService.init()
        const keys = ["_id", "firstName", "lastName", "email", "token", "userType"];
        for (let key of Object.keys(user)) {
            if (keys.indexOf(key) !== -1) {
                cookie.save(key, user[key], { path: USER_COOKIE_PATH});
            }
        }
       CookieService.dispatchEvent(new Event(this.USER_LOGIN_STATUS, "user logged In"));
    }

    clearUser(user: UserModel) {
        for (let key of Object.keys(user)) {
            cookie.remove(key, user[key], { path: USER_COOKIE_PATH});
        }
    }
    clearAll() {
        AuthServerService.clearCookie(); // clear token
        const allCookies = cookie.loadAll();
        for (let key of Object.keys(allCookies)) {
            cookie.remove(key, { path: USER_COOKIE_PATH});
        }
    }
    get user() {
        const user: UserModel = new UserModel();
        for (let key of Object.keys(user)) {
            const cookie_data: any = cookie.load(key);
            if (cookie_data) {
                user[key] = cookie_data;
            }
        }
        user.token = AuthServerService.token?AuthServerService.token:user.token;
        return user;
        
    }
    async getUser() {
        if(AuthServerService.token === ""){
            await AuthServerService.init();
            CookieService.dispatchEvent(new Event(this.USER_LOGIN_STATUS, "user logged In"));
        }
        const user: UserModel = new UserModel();
        for (let key of Object.keys(user)) {
            const cookie_data: any = cookie.load(key);
            if (cookie_data) {
                user[key] = cookie_data;
            }
        }
        user.token = AuthServerService.token;
        return user;
        
    }
}

export default CookieService;