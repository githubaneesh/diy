import HttpService from "./httpservice";

let _singleton = true;
let _instance;

const _httpService = HttpService.instance;

class OrganizationService {
   
    constructor(){
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use OrganizationService.instance instead!');
        }        
    }

    static GET_ORGANIZATIONS_LIST() { return `/organizations/list`}
    static GET_USER_ORGANIZATION(userId) { return `/user/${userId}/organization`}
    static CREATE_ORGANIZATION() { return `/organizations/create` }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new OrganizationService();
            _singleton = true;
        }
        return _instance;
    }

    async getOrganizations(){
        const requestUrl = OrganizationService.GET_ORGANIZATIONS_LIST();
        const dateObj = new Date();
        const urlWithCacheBurster = `${requestUrl}?cb=${dateObj.getTime()}`;
        return await _httpService.requestV3Server(HttpService.GET, urlWithCacheBurster, null);
    }

    async getUserOrganization(userId){
        const requestUrl = OrganizationService.GET_USER_ORGANIZATION(userId);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }

    async createOrganization(postData){
        const requestUrl = OrganizationService.CREATE_ORGANIZATION();
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postData);
    }

}

export default OrganizationService;