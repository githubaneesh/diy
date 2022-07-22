import HttpService from "./httpservice";
import Settings  from "../config/settings";
let _singleton = true;
let _instance;
const _httpService = HttpService.instance;
class AuthService{

    constructor () {
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use AuthService.instance instead!');
        }

    }

    static get VALIDATE_TOKEN () { return "/validate/token" };
    static get VALIDATE_CREDENTIALS () { return "/policy" };
    static get UPDATE_POLICY () { return "/policy/update" };
    static get GET_TOKEN () { return "/token" };

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new AuthService();
            _singleton = true;
        }
        return _instance;
    }

    async validateToken (token) {
        return await _httpService.requestServer(HttpService.POST, Settings.API_V3_BASE_URL + AuthService.VALIDATE_TOKEN, {
            token
        }, {
            "Content-Type":"application/json"
        }); 
    }

    async validateCredentials (credentials) {
        return await _httpService.requestServer(HttpService.POST, Settings.API_V1_BASE_URL + AuthService.VALIDATE_CREDENTIALS, credentials, {
            "Content-Type":"application/json; charset=utf-8"
        }); 
    }
    async updatePolicy (postContent) {
        return await _httpService.requestServer(HttpService.POST, Settings.API_V1_BASE_URL + AuthService.UPDATE_POLICY, postContent, {
            "Content-Type":"application/json; charset=utf-8"
        }); 
    }
    async getToken (postContent) {
        return await _httpService.requestServer(HttpService.POST, Settings.API_V1_BASE_URL + AuthService.GET_TOKEN, postContent, {
            "Content-Type":"application/json; charset=utf-8"
        }); 
    }          

}
export default AuthService;