import HttpService from "./httpservice";

let _singleton = true;
let _instance;

const _httpService = HttpService.instance;

export default class TagService {

    static STUDY_TAGS_V1 (id) { return `/tags/allbystudy/${id}`; }
    static EDIT_TAGS_V1 (id) { return `/tags/edit/${id}`; }
    static DELETE_TAGS_V1 (id) { return `/tags/delete/${id}`; }
    static CREATE_TAGS_V1 () { return `/tags/create`; }
    static ADD_STUDY_TAG(tagId) { return `/tags/addtag/${tagId}`; }
    static REMOVE_STUDY_TAG(tagId) { return `/tags/removetag/${tagId}`; }

    constructor(){
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use TagService.instance instead!');
        }
    }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new TagService();
            _singleton = true;
        }
        return _instance;
    }

    async getStudyTags (study) {
        const requestUrl = TagService.STUDY_TAGS_V1(study);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, null);
    }

    async saveEditedTag (tagId, postContent) {
        const requestUrl = TagService.EDIT_TAGS_V1(tagId);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async deleteTag (tagId) {
        const requestUrl = TagService.DELETE_TAGS_V1(tagId);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, null);
    }

    async createTags(postData) {
        const requestUrl = TagService.CREATE_TAGS_V1();
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postData);
    }

    async addStudyTagV3(tagId, postData) {
        const requestUrl = TagService.ADD_STUDY_TAG(tagId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postData);
    }

    //this is currently getting called while binding of study tag which is remaining for v3 migration
    async addStudyTag(tagId, postData) {
        const requestUrl = TagService.ADD_STUDY_TAG(tagId);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postData);
    }
    //this is currently getting called while unbinding of study tag which is remaining for v3 migration
    async removeStudyTag(tagId, postData) {
        const requestUrl = TagService.REMOVE_STUDY_TAG(tagId);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postData);
    }

    async removeStudyTagV3(tagId, postData) {
        const requestUrl = TagService.REMOVE_STUDY_TAG(tagId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postData);
    }

}