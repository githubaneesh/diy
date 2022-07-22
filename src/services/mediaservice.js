import HttpService from "./httpservice";
import axios from "axios";
let _singleton = true;
let _instance;
const _httpService = HttpService.instance;
class MediaService {
    constructor () {
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use MediaService.instance instead!');
        }
    }

    // static get SIGNED_URL () { return `/s3/generate/signedurl`; }
    static get SIGNED_URL () { return process.env.REACT_APP_UPLOAD_MEDIA_SIGNED_URL }
    static get GENERATE_SIGNED_URL () { return process.env.REACT_APP_GET_MEDIA_SIGNED_URL}
    static DELETE_MEDIA_URL (questionId) { return `/questionnaire/${questionId}/media/delete` }
    static USER_PROFILE_PICTURE (userId) { return `/user/${userId}/profile/picture` }
    static UPDATE_MEDIA_DESCRIPTION() { return `/media/description/update`}

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new MediaService();
            _singleton = true;
        }
        return _instance;
    }

    async getSignedUrl (filename, isPublic=true) {
        const mediaContent = { "filename": filename };
        return await _httpService.getUploadSignedUrl(MediaService.SIGNED_URL, mediaContent);
    }

    async uploadMedia (signedUrl, file, fileType, contentEncoding) {
        return await _httpService.requestServer(HttpService.PUT, signedUrl, file, {'Content-Type': fileType});
    }

    async deleteMedia (questionId) {
        const requestUrl = MediaService.DELETE_MEDIA_URL(questionId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, {}, {
            "Content-Type":"application/json"
        });
    }

    async getUserProfilePicture(userId) {
        const requestUrl = MediaService.USER_PROFILE_PICTURE(userId);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }

    async updateMediaDescription(postContent) {
        const requestUrl = MediaService.UPDATE_MEDIA_DESCRIPTION();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async generateSignedUrl(mediaId) {
        let resp;
        try {
            resp = await _httpService.generateSignedUrl(MediaService.GENERATE_SIGNED_URL, mediaId);
        }
        catch(e) {
            console.log("Error",e)
        }
        return resp ? resp.data.signedUrl : null;
    }
}
export default MediaService;