import HttpService from "./httpservice";
let _singleton = true;
let _instance;
const _httpService = HttpService.instance;

class OccupationService {
    constructor () {
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use OccupationService.instance instead!');
        }
    }

    static GET_OCCUPATION () { return `/occupations`; }
    static CREATE_OCCUPATION () { return `/occupation/create`}

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new OccupationService();
            _singleton = true;
        }
        return _instance;
    }
    async getOccupationList(){
        const requestUrl = OccupationService.GET_OCCUPATION();
        return await _httpService.requestV1Server(HttpService.GET, requestUrl, null);
    }


    async createOccupation(occupationName){
        const postContent = {"name": occupationName};
        const requestUrl = OccupationService.CREATE_OCCUPATION();
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

}

export default OccupationService;