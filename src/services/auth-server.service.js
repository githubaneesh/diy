import Cookies from 'universal-cookie';
import axios from "axios";

import Settings  from "../config/settings";
import NotifierService from './notifierService';
let _singleton = true;
let _instance;

class AuthServerService{
    accessToken = '';
    refreshToken;
    cookies;
    refreshingToken = false;
    _notifierService = NotifierService.instance;
    constructor () {
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use AuthServerService.instance instead!');
        }
        this.cookies = new Cookies();
    }

    static get LOGIN () { return "/auth/login" };
    static get REFRESH_TOKEN () { return "/auth/refresh-token" };
    static get USER_PRIVACY () { return "/user/privacy" };
    
    get token(){
        return this.accessToken;
    }
    get refresh_token(){
        return this.cookies.get('refreshToken');
    }
    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new AuthServerService();
            _singleton = true;
        }
        return _instance;
    }

    async init(){ 
        if(this.token === ""){
            const token = this.cookies.get('refreshToken');
            return await this.updateRefreshToken(token, true);
        }
        return null;
    }

    wait = async (ms) => {
        let count = 0;
        return new Promise((r, j)=>setInterval(() => {
            ++count
            if(this.token !== "" || count>3){
                r();
            }
        }, ms))
    };

    clearCookie(){ 
        this.cookies.remove('refreshToken')
    }
    async login (userdata) {
        // let userdata = {email, password};
        this.clearCookie();
        try {
            const response = await axios.post( Settings.API_AUTH_BASE_URL + AuthServerService.LOGIN, userdata,{ headers: { "Content-Type" : "application/json; charset=utf-8"}});
            if(response.status === 200 && response.data  && response.data.data && response.data.data.error){
                return null;
            }
            this.updateToken(response);
            return await this.getUserPrivacy();
        } catch (error) {
            console.log("Login Error ",error);
            return error;
        }
        
    }


    async refreshAccessToken() {
        const token = this.cookies.get('refreshToken');
        return await this.updateRefreshToken(token);
    }

    async updateRefreshToken(token, booCallUser = false) {
        if(token && !this.refreshingToken){
            this.refreshingToken = true;
            try {
                let response = await axios.post(Settings.API_AUTH_BASE_URL + AuthServerService.REFRESH_TOKEN, {}, {headers: {'x-access-token': token}, "Content-Type":"application/json"});
                this.updateToken(response);
                this.refreshingToken = false;
                if(booCallUser){
                    response = await this.getUserPrivacy();
                    console.log("updateRefreshToken",response);
                }
                return response;
            } catch (error) {
                this.clearCookie();
                if(error.response && error.response.status === 401){
                    // window.location.reload();
                }
                if(error.response && error.response.status === 404){
                    window.location.href = '/login';
                }
            }
            this.refreshingToken = false;
        
        } else if(!token && window.location.pathname !== '/login' && window.location.pathname !== '/reset-password'){
            window.location.href = '/login';
        }
        return null;
    }

    async getUserPrivacy() {
        try {
            const response = await axios.get( Settings.API_V3+AuthServerService.USER_PRIVACY, {headers: {'authorization': this.token}, "Content-Type":"application/json"});
            console.log("response getUser()", response)
            return response.data;
        } catch (error) {
            if(error.response && error.response.status === 401){
                // window.location.reload();
            }
        }
        return null;
    }

    updateToken(response){
        console.log(response)
        if(response.status === 200){
            this.accessToken = "Bearer " + response.data.data.accessToken;
            this.refreshToken = response.data.data.refreshToken;
            console.log(this.accessToken);
            
            this.cookies.set('refreshToken', this.refreshToken)
        }
    }

    async requestServer(method, url, data, booReload = true) {
        if(this.token === ""){
            await this.refreshAccessToken();
            await this.wait(500);
        }
        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            "authorization": this.token
        }
        let response;
        try {
            const requestUrl = Settings.API_AUTH_BASE_URL+url;
            response = await axios.request({
                url: requestUrl,
                method,
                headers,
                data
            });
            if(!booReload){
                this.showMessageOnError(response);
            }
            return response.data;
        } catch (e) {
            console.log("Exception", e);
            if(e.response && e.response.status === 401){
                if(!booReload){
                    await this.refreshAccessToken();
                }

                if(booReload){
                    return await this.requestServer(method, url, data, false)
                }
            }
        }
    }

    showMessageOnError(resp) {
        if(resp.error) {
            this._notifierService.showMessage(resp);
            return;
        }
    }

    // async validateToken (token) {
    //     return await _httpService.requestServer(HttpService.POST, Settings.API_V3_BASE_URL + AuthService.VALIDATE_TOKEN, {
    //         token
    //     }, {
    //         "Content-Type":"application/json"
    //     }); 
    // }

    // async validateCredentials (credentials) {
    //     return await _httpService.requestServer(HttpService.POST, Settings.API_V1_BASE_URL + AuthService.VALIDATE_CREDENTIALS, credentials, {
    //         "Content-Type":"application/json; charset=utf-8"
    //     }); 
    // }
    // async updatePolicy (postContent) {
    //     return await _httpService.requestServer(HttpService.POST, Settings.API_V1_BASE_URL + AuthService.UPDATE_POLICY, postContent, {
    //         "Content-Type":"application/json; charset=utf-8"
    //     }); 
    // }
    // async getToken (postContent) {
    //     return await _httpService.requestServer(HttpService.POST, Settings.API_V1_BASE_URL + AuthService.GET_TOKEN, postContent, {
    //         "Content-Type":"application/json; charset=utf-8"
    //     }); 
    // }          

}
export default AuthServerService.instance;