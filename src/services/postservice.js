import HttpService from "./httpservice";
import MediaService from "./mediaservice";
let _singleton = true;
let _instance;
const _httpService = HttpService.instance;
const _mediaService = MediaService.instance;

class PostService {
    constructor () {
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use PostService.instance instead!');
        }
    }

    static QUESTION_POST (questionId) { return `/questionPost/${questionId}`; }
    static CREATE_POST () { return `/post/create`; }
    static UPDATE_POST (postId) { return postId ? `/post/update/${postId}` : `/post/update`; }
    static CREATE_COMMENT() { return `/comment/create`; }
    static ADD_POST_IMAGE (post) {return `/media/post/${post}/image`; }
    static ADD_POST_VIDEO (post) {return `/media/post/${post}/video`; }
    static ADD_POST_VIDEO_THUMBNAIL (post) {return `/media/post/${post}/video-thumbnail`; }
    static GET_PARTICIPANT_POSTS (participantId) { return `/post/postBelongToParticipant/${participantId}`; }
    static GET_POST_COMMENTS (postId) { return `/post/comment/${postId}`; }
    static UPDATE_POST_STATUS () {return `/update_post_status`}
    static DELETE_POST (postId) { return `/post/delete/${postId}`; }
    static UPDATE_READ_STATUS (postId) { return `/post/update/readStatus` }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new PostService();
            _singleton = true;
        }
        return _instance;
    }

    async getQuestionPost(questionId) {
        const requestUrl = PostService.QUESTION_POST(questionId);
        return await _httpService.requestV3Server( HttpService.GET, requestUrl, null);
    }

    async createPost(postContent){
        const requestUrl = PostService.CREATE_POST();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async updatePost(postContent, postId) {
        const requestUrl = PostService.UPDATE_POST(postId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async updatePostV1(postContent, postId) {
        console.log("updatePostV1: ", postId)
        const requestUrl = PostService.UPDATE_POST(postId);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async createComment(postContent) {
        const requestUrl = PostService.CREATE_COMMENT();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async addPostImage(postId, filename) {
        const requestUrl = PostService.ADD_POST_IMAGE(postId);
        const response = await _mediaService.getSignedUrl(filename);
        if (response.error) {
            return {error: true};
        }
        return response;
    }

    async addPostVideo(postId, filename) {
        const requestUrl = PostService.ADD_POST_VIDEO(postId);
        //let mediaObject = new FormData();
        //mediaObject.append("video", videoFile);
        //mediaObject.append("Content-Type", videoFile.type)
        const response = await _mediaService.getSignedUrl(filename);
        if (response.error) {
            return {error: true};
        }
        return response;
    }

    async addPostThumbnail(postId, thumbnailfilename) {
        const requestUrl = PostService.ADD_POST_VIDEO_THUMBNAIL(postId);
        // let mediaObject = new FormData();
        // mediaObject.append("videoThumbnail", videoThumbnailFile);
        const response = await _mediaService.getSignedUrl(thumbnailfilename);
        if (response.error) {
            return {error: true};
        }
        return response;
    }

    async getParticipantPosts(participantId, postContent = null) {
        const requestUrl = PostService.GET_PARTICIPANT_POSTS(participantId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async getPostComments(postId) {
        const requestUrl = PostService.GET_POST_COMMENTS(postId);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, null);
    }

    async updatePostSatus(postContent, postId) {
        const requestUrl = PostService.UPDATE_POST_STATUS(postId);
        return  await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async deletePost(postId) {
        const requestUrl = PostService.DELETE_POST(postId);
        return  await _httpService.requestV1Server(HttpService.POST, requestUrl, null);
    }

    async updateReadStatus(postContent) {
        const requestUrl = PostService.UPDATE_READ_STATUS();
        return  await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

}

export default PostService;