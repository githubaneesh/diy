import HttpService from "./httpservice";
import AuthServerService from './auth-server.service';
let _singleton = true;
let _instance;
const _httpService = HttpService.instance;

class UserService {
    constructor () {
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use UserService.instance instead!');
        }
    }

    static GET_USER_LIST (userType) { return `/user/list/${userType}`; }
    static GET_USER_COUNT (userType) { return `/user/count/${userType}`; }
    static GET_USER_DETAILS (user) {
        if(user){ return `/user/${user}`}
        return `/user`
    }
    static GET_USER_PARTICIPATIONS() {return `/participant`}
    static GET_USER_ROLES () { return `/role`}
    static CREATE_USER() { return `/user/create`}
    static UPDATE_USER (user) { return `/user/update/${user}`}
    static DELETE_CHILDREN () { return `/children/delete`}
    static UPDATE_CHILDREN () { return `/children/update`}
    static CREATE_CHILDREN () { return `/children/create`}
    static GET_LOCATIONS () { return `/locations`}
    static GET_ALL_PROSPECT_USERS () { return `/user/prospect/all`; }
    static DELETE_USER (user) { return `/user/${user}`}
    static DOWNLOAD_USERS() { return `/auth/download/users`; }
    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new UserService();
            _singleton = true;
        }
        return _instance;
    }

    async getUserList(postContent, userType) {
        const requestUrl = UserService.GET_USER_LIST(userType);
        return await _httpService.requestV3ServerCancellableRequest( HttpService.POST, requestUrl, postContent);
    }

    async getUserCount(postContent, userType) {
        const requestUrl = UserService.GET_USER_COUNT(userType);
        return await _httpService.requestV3ServerCancellableRequest( HttpService.POST, requestUrl, postContent);
    }

    async getUserDetails(user = null) {
        const requestUrl = UserService.GET_USER_DETAILS(user);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }

    async getUserParticipationList(postContent) {
        const requestUrl = UserService.GET_USER_PARTICIPATIONS();
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);        
    }

    async getUserRoles() {
        const requestUrl = UserService.GET_USER_ROLES();
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, null);
    }

    async createUser(postContent) {
        const requestUrl = UserService.CREATE_USER();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async updateUser(user, postContent){
        const requestUrl = UserService.UPDATE_USER(user);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async deleteChildren(postContent){
        const requestUrl = UserService.DELETE_CHILDREN();
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }
    async updateChildren(postContent) {
        const requestUrl = UserService.UPDATE_CHILDREN();
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async createChidren(postContent){
        const requestUrl = UserService.CREATE_CHILDREN();
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async getLocations(){
        const requestUrl = UserService.GET_LOCATIONS();
        return await _httpService.requestV1Server(HttpService.GET, requestUrl, null);
    }

    async getAllProspectUsers() {
        const requestUrl = UserService.GET_ALL_PROSPECT_USERS();
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }

    async deleteUser(user) {
        const requestUrl = UserService.DELETE_USER(user);
        return await _httpService.requestV3Server(HttpService.DELETE, requestUrl, null);
    }

    async downloadProspectUsers(postContent) {
        const requestUrl = UserService.DOWNLOAD_USERS();
        return await AuthServerService.requestServer(HttpService.POST, requestUrl, postContent);
    }

}

export default UserService;