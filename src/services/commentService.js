import HttpService from "./httpservice";

let _singleton = true;
let _instance;

const _httpService = HttpService.instance;

export default class CommentService {

    static UPDATE_COMMENT_V1 (id) { return `/comment/update/${id}`; }
    static DELETE_COMMENT_V1 (id) { return `/comment/delete/${id}`; }
    static GET_LOCALE_COMMENT_V1 (id) { return `/../locale/comment/get/${id}`; }
    static UPDATE_LOCALE_COMMENT_V1 (id) { return `/../locale/comment/update/${id}`; }
    // V3 locale comment api
    static UPDATE_LOCALE_COMMENT_V3 (id) { return `/locale/comment/update/${id}`; }
    static CREATE_LOCALE_COMMENT_V1 () { return `/../locale/comment/create`; }
    static GET_LOCALE_COMMENTS_V3() { return `/locale/comments`; }

    constructor(){
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use CommentService.instance instead!');
        }
    }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new CommentService();
            _singleton = true;
        }
        return _instance;
    }

    async updateComment (commentId, postContent) {
        const requestUrl = CommentService.UPDATE_COMMENT_V1(commentId);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async deleteComment (commentId) {
        const requestUrl = CommentService.DELETE_COMMENT_V1(commentId);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, null);
    }

    async getLocaleComment (commentId) {
        const requestUrl = CommentService.GET_LOCALE_COMMENT_V1(commentId);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, null);
    }

    async updateLocaleComment (commentId, postContent) {
        const requestUrl = CommentService.UPDATE_LOCALE_COMMENT_V3(commentId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async createLocaleComment (postContent) {
        const requestUrl = CommentService.CREATE_LOCALE_COMMENT_V1();
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async getLocaleComments (postContent) {
        const requestUrl = CommentService.GET_LOCALE_COMMENTS_V3();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent)
    }

}