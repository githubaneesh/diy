import axios from "axios";
import Settings from "../config/settings";
import CookieService from "./cookieservice";
import NotifierService from './notifierService';
import AuthServerService from './auth-server.service';
const _cookieService = CookieService.instance;

let _singleton = true;
let _instance;
class HttpService {
    _notifierService = NotifierService.instance;
    objCancel = {};
    constructor(){
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use HttpService.instance instead!');
        }        
    }

    static get GET () { return "get"; }
    static get POST () { return "post"; }
    static get PUT () { return "put"; }
    static get DELETE () { return "delete"; }
    static get API_V3 () { return Settings.API_V3; }
    static get API_V1 () { return Settings.API_BASE_URL; }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new HttpService();
            _singleton = true;
        }
        return _instance;
    }
    async requestV1Server (method, url, data, booReload = true) {
        if(AuthServerService.token === ""){
            await AuthServerService.refreshAccessToken();
            await AuthServerService.wait(500);
        }
        const user = _cookieService.user;
        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            "authorization": AuthServerService.token
        }
             
        let response;
        try {
            const requestUrl =  HttpService.API_V1 + url;
            response = await axios.request({
                url: requestUrl,
                method,
                headers,
                data
            });
            if(!booReload){
                this.showMessageOnError(response);
            }
            // this.showMessageOnError(response);
            return response.data;
        } catch (e) {
            console.log("Exception", e);
            //this.showMessageOnError({error: true, message: e.message});
            if(e.response && e.response.status === 401){
                if(!booReload){
                    await AuthServerService.refreshAccessToken();
                }

                if(booReload){
                    return await this.requestV1Server(method, url, data, false)
                }
            }
        }
    }

    async requestV3Server(method, url, data, booReload = true) {
        if(AuthServerService.token === ""){
            await AuthServerService.refreshAccessToken();
            await AuthServerService.wait(500);
        }
        const user = _cookieService.user;
        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            "authorization": AuthServerService.token
        }
        let response;
        try {
            const requestUrl = HttpService.API_V3+url;
            response = await axios.request({
                url: requestUrl,
                method,
                headers,
                data
            });
            if(!booReload){
                this.showMessageOnError(response);
            }
            // this.showMessageOnError(response);
            return response.data;
        } catch (e) {
            console.log("Exception", e);
            if(e.response && e.response.status === 401){
                if(!booReload){
                    await AuthServerService.refreshAccessToken();
                }

                if(booReload){
                    return await this.requestV3Server(method, url, data, false)
                }
            }
            
            //this.showMessageOnError({error: true, message: e.message});
        }
    }


    async getUploadSignedUrl(url, mediaContent) {
        const user = _cookieService.user;
        const headers = {
            "Content-Type" : "application/json",
            "authorization": AuthServerService.token
        }
        try {
            const response = await axios.post(url, mediaContent, {headers});
            return response.data.body;
        } catch (e) {
            console.log("Exception", e);
        }
    }

    async generateSignedUrl(url, mediaId) {
        const user = _cookieService.user;
        const headers = {
            "Content-Type" : "application/json",
            "authorization": AuthServerService.token,
            "object-key": mediaId
        }
        try {
            const response = await axios.get(url, {headers});
            return response;
        } catch (e) {
            console.log("Exception", e);
        }
    }

    async requestServer(method, url, data, options) {
        let response;
        try {
            response = await axios[method](url, data, options);
            this.showMessageOnError(response);
            return response.data;
        } catch (e) {
            console.log("Exception", e);
        }
    }

    async requestGoogleServer(method, url, data) {
        let response;
        try {
            response = await axios[method](url, data);
            return response.data;
        } catch (e) {
            return e;
        }
    }

    showMessageOnError(resp) {
        if(resp.error) {
            this._notifierService.showMessage(resp);
            return;
        }
    }

    async requestV3ServerCancellableRequest(method, url, data) {
        if(AuthServerService.token === ""){
            await AuthServerService.refreshAccessToken();
            await AuthServerService.wait(500);
        }
        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            "authorization": AuthServerService.token
        }
        let response;
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const key = url.replace(new RegExp("/", "g"), "_")
        console.log("this.objCancel[url]", key, this.objCancel);
        if(!this.objCancel[key]) {
            this.objCancel[key] = [];
        } 

        while(this.objCancel[key].length>0){
            const s = this.objCancel[key].pop();
            s.cancel('Operation canceled by the user.');
        }
        
        this.objCancel[key].push(source);
        try {
            const requestUrl = HttpService.API_V3+url;
            response = await axios.request({
                url: requestUrl,
                method,
                headers,
                data,
                cancelToken : source.token
            });
            console.log("this.objCancel[key]", this.objCancel[key]);
            this.showMessageOnError(response);
            // this.objCancel[key] = null;
            return response.data;
        } catch (e) {

            if (axios.isCancel(e)) {
                console.log('Request canceled', e.message);
              } else {
                // handle error
              }
            console.log("Exception", e);
            //this.showMessageOnError({error: true, message: e.message});
        }
    }

}
export default HttpService;