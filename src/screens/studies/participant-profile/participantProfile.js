import StudyService from "../../../services/studyService";
import ParticipantService from "../../../services/participantService";
import UserService from "../../../services/userservice";
import PostService from "../../../services/postservice";
import CookieService from "../../../services/cookieservice";
import CommentService from '../../../services/commentService';
import GoogleTranslateService from "../../../services/googletranslate";
import TranscribeService from "../../../services/transcribeService";
import QuestionaireService from "../../../services/questionaireService";
const _studyService = StudyService.instance;
const _participantService = ParticipantService.instance;
const _userService = UserService.instance;
const _postService = PostService.instance;
const _cookieService = CookieService.instance;
const _commentService = CommentService.instance;
const _googleTranslate = GoogleTranslateService.instance;
const _transcribeService = TranscribeService.instance;
const _questionaireService = QuestionaireService.instance;

let _owner;
let _participantDetails;

export default class ParticipantController {
    _studyParticipants = [];
    _locations = {US:[]};
    sorted = false;
    userData = {};
    postCount = 0;
    posts = [];
    postComments = [];

    constructor (owner) {
        _owner = owner;
    }

    set StudyParticipants(participants) {
        this._studyParticipants = participants;
    }

    get StudyParticipants(){
        return this._studyParticipants || [];
    }

    async fetchStudyParticipants(studyId){
        const response = await _studyService.getStudyParticipants(studyId);
        if(response && response.body){
            this.StudyParticipants = response.body;
        }
    }

    async getUserDetails(userId) {
        const response = await _userService.getUserDetails(userId);
        if(response && response.data) {
            this.userData = response.data;
        }
    }

    async fetchPost( participantId) {
        await this.getPostCount(participantId);
        await this.getPartcipantPosts(participantId);
    }

    async fetchMorePosts(participantId) {
        if (this.posts.length < this.postCount) {
            const postContent = { "from": this.posts.length }
            const response = await _postService.getParticipantPosts(participantId, postContent);
            if(response && response.body) {
                response.body.forEach(post => {
                    if(post.sequence) {
                        post["tag"] = `${post.sequence.seqTopic}${post.sequence.seqQn}`;
                    }
                    return post;
                });
            }
            this.posts = [...this.posts, response.body];
            this.posts = this.posts.sort((a, b) => a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0);
        }
    }

    sortPartcipant(key){
        
        this.StudyParticipants.sort((a,b) => {
            if (!this.sorted) {
                if (key === "name") {
                    return a.user[key].localeCompare(b.user[key]);
                }
                else if (key === "groupName" && (a.group && b.group)){
                    return a.group["name"].localeCompare(b.group["name"])
                }
            }

            else {
                if (key === "name") {
                    return b.user[key].localeCompare(a.user[key]);
                }
                else if (key === "groupName" && (b.group && a.group)) {
                    return b.group["name"].localeCompare(a.group["name"])
                }
            }
           
        });

        this.sorted = !this.sorted;
        _owner.refreshUI();
    }

    async getStudyDetails (study) {
        return await _studyService.getStudyDetails(study);
    }

    async getParticipantDetails (participant) {
        const response = await _participantService.getParticipantDetails(participant);
        if (response && response.data) {
            _participantDetails = response.data;
            if ((!response.data.user.city && !response.data.user.state && !response.data.user.country) && response.data.user.location) {
                if (this._locations.US.length === 0) {
                    await this.fetchLocations();
                }

                let userLocation = this._locations.US[`${response.data.user.location[1]},${response.data.user.location[0]}`];
                response.data.user["state"] = userLocation.s;
                response.data.user["city"] = userLocation.c;
            }
        }

        return response;
    }

    async updateParticipant(data, participantId) {
        const response = await _participantService.updateParticipant(participantId, data);
        if (response && response.data) {

            if ((!response.data.user.city && !response.data.user.state && !response.data.user.country) && response.data.user.location) {

                if (this._locations.US.length === 0) {
                    await this.fetchLocations();
                }

                let userLocation = this._locations.US[`${response.data.user.location[1]},${response.data.user.location[0]}`];
                response.data.user["State"] = userLocation.s;
                response.data.user["City"] = userLocation.c;
            }
        }
        return response;
    }

    async deleteParticipant(participantId) {
        const response = await _participantService.deleteParticipant(participantId);
        return response;
    }

    async fetchLocations(){
        const locations = await _userService.getLocations();
        this._locations = locations;
    }

    async getPostCount(participantId) {
        const response = await _participantService.getParticipantCount(participantId);
        if(response && !response.error) {
            this.postCount = response.data;
        }
    }

    async getPartcipantPosts(participantId) {
        const questionnaireResponse = await _questionaireService.getQuestionnaireByGroup(_participantDetails.study._id, _participantDetails.group._id);
        const response = await _postService.getParticipantPosts(participantId);
        if(response && response.body) {
            this.posts = response.body;
            
            this.posts.forEach(post => {
                if(post.sequence) {
                    post["tag"] = `${post.sequence.seqTopic}${post.sequence.seqQn}`;
                }
                return post;
            });
        }
        this.posts = this.mapQuestionnaireWithPost(this.posts, questionnaireResponse.body);
        this.posts = this.posts.sort((a, b) => a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0);
    }

    mapQuestionnaireWithPost(posts, questionnaire) {
        const newPosts = [...posts];
        const postLen = newPosts.length;
        let newQuestionnaire = [...questionnaire];
        const questionnaireLen = newQuestionnaire.length;

        for(let i=0; i<postLen; i++){
            newPosts[i]["mediaLength"] = newPosts[i].media ? newPosts[i].media.length : 0;
            for(let j=0; j<questionnaireLen; j++) {
                if(newQuestionnaire[j] && newQuestionnaire[j].hasOwnProperty("attachment")
                    && newQuestionnaire[j].attachment.length
                    && newPosts[i].questionnaire._id === newQuestionnaire[j]._id) {
                        newQuestionnaire[j].attachment.forEach(function (element) {
                            element.isQuestionMedia = true;
                        });
                        newPosts[i]["questionMedia"] = newQuestionnaire[j].attachment;
                        newQuestionnaire.splice(j, 1);
                        --j;
                }
            }
            newPosts[i]["mediaLength"] = newPosts[i]["mediaLength"] + (newPosts[i]["questionMedia"] ? newPosts[i]["questionMedia"].length : 0);
        }
        const questionnaireWithMedia = newQuestionnaire.filter(item => item.hasOwnProperty("attachment") && item.attachment.length);
        for(let k=0; k<questionnaireWithMedia.length; k++) {
            questionnaireWithMedia[k].attachment.forEach(function (element) {
                element.isQuestionMedia = true;
            });
            if(questionnaireWithMedia[k].sequence) {
                newPosts.push({
                    "tag": `${questionnaireWithMedia[k].sequence.seqTopic}${questionnaireWithMedia[k].sequence.seqQn}`,
                    "questionnaire": {"task": questionnaireWithMedia[k].task, "_id": questionnaireWithMedia[k]._id},
                    "questionMedia": questionnaireWithMedia[k].attachment,
                    "topic": questionnaireWithMedia[k].topic,
                    "mediaLength": questionnaireWithMedia[k].attachment.length
                });
            }
        }
        return newPosts;
    }

    getLocation(City = '', State = '', Country = '') {

        let stateStr = (State && City !== State) ? `, ${State}` : '';
        let countryStr = Country ? `, ${Country}` : Country;
        let location = '';
        location = `${City}${stateStr}${countryStr}`;
        return location;
    }

    async getPostComments(postId) {
        const response = await _postService.getPostComments(postId);
        if (response && response.data) {
            this.postComments = response.data;
        }
    }

    async fetchLocaleComments() {
        this.postComments = this.postComments.sort((a, b) => { return new Date(a["createdAt"]) - new Date(b["createdAt"]) });
        if (this.postComments.length > 0) {
            let commentIds = this.postComments.map(c => c._id);
            let postContent = { "Ids": commentIds };
            let localeComments = await _commentService.getLocaleComments(postContent);
            if (localeComments && localeComments.body && localeComments.body.length > 0) {
                for (let comment of this.postComments) {
                    let localeComment = localeComments.body.find(c => c.comment == comment._id);
                    
                    if (localeComment) {
                        comment["localeComment"] = localeComment;
                        comment.localeComment["post"] = comment.post;
                    }
                }
            }
        }
    }

    async fetchLocaleForTranscribeComments(commentIds = []) {
        this.postComments = this.postComments.sort((a, b) => { return new Date(a["createdAt"]) - new Date(b["createdAt"]) });
        let postContent = { "Ids": commentIds };
        let localeComments = await _commentService.getLocaleComments(postContent);
        if (localeComments && localeComments.body && localeComments.body.length > 0) {
            for (let comment of this.postComments) {
                let localeComment = localeComments.body.find(c => c.comment == comment._id);
                if (localeComment) {
                    comment["localeComment"] = localeComment;
                    comment.localeComment["post"] = comment.post;
                }
            }
        }
    }

    async createComment(postId, text, selectedPost) {
        const user = _cookieService.user;
        let postContent;
        if(user && user._id && postId) {
            postContent = {};
            postContent["text"] = text;
            postContent["createdBy"] = user._id;
            postContent["post"] = postId;
            return await _postService.createComment(postContent);
        }
        else {
            const response = await this.createPostOnComment(user._id, _participantDetails.user._id, _participantDetails.study._id, selectedPost.topic, selectedPost.questionnaire._id);
            postContent = {};
            postContent["text"] = text;
            postContent["createdBy"] = user._id;
            postContent["post"] = response.body._id;
            return await _postService.createComment(postContent);
        }
    }

    async createPostOnComment(createdBy, userId, studyId, topicId, questionId) {
        const postContent = {
            "user": userId,
            "createdBy": createdBy,
            "study": studyId,
            "topic": topicId,
            "questionnaire": questionId
        }

        return await _postService.createPost(postContent);
        /*if (response && response.body) {
            this.questionPost.push(response.body);
        }*/
        
    }

    async updatePostSatus(postContent) {
      const response = await _postService.updatePostSatus(postContent);
      return response;
    }

    async markPostAsResolved(postData, postId) {
        console.log("markPostAsResolved: ", postId);
        const response = await _postService.updatePostV1(postData, postId);
        return response;
    }

    async deletePost(postId, participantId) {
        const response = await _postService.deletePost(postId);
        if (response && response.data) {
            this.posts = this.posts.filter((post) => {
                return post._id && post._id !== postId;
            })
            await this.getPostCount(participantId);
        }
    }

    async deletePostComment(commentId) {
        return await _commentService.deleteComment(commentId);
    }

    async updatePostComment(updatedComment, updateLocale) {
        if (updateLocale) {
            return await _commentService.updateLocaleComment(updatedComment._id, {text: updatedComment.text})
        } else {
            return await _commentService.updateComment(updatedComment._id, updatedComment);
        }
    }

    async translateQuestion(questionText) {
        return await _googleTranslate.translateToDefault(questionText);
    }

    async updateTranslatedQuestion(questionId, translatedQuestion) {
        const requestBody = {
            task_translated: translatedQuestion
        }
        return await _questionaireService.updateQuestion(questionId, requestBody);
    }

    async translatePostComment() {
        for (var comment of this.postComments) {
            var response = await _commentService.getLocaleComment(comment._id);
            if (response && !response.localeComment) {
                // detect and create locale comment
                var translatedData = await _googleTranslate.translateToDefault(comment.text);
                if (!translatedData.error && translatedData.body[0].translatedText) {
                    var createResponse = await _commentService.createLocaleComment({
                        comment: comment._id,
                        text: translatedData.body[0].translatedText,
                        locale: translatedData.body[0].detectedSourceLanguage
                    });
                    if (createResponse.localeComment) {
                        response = createResponse;
                    } else {
                        // go to next comment
                        continue;
                    }
                }
            }
            comment['localeComment'] = response.localeComment;
            if(comment['localeComment']) {
                comment.localeComment["post"] = comment.post;
            }
        }
    }

    async getVideoTranscribeComments(videoUrls, isTranscribeDisabled=false) {
        var commentIds = []
        if (videoUrls.length > 0 && !isTranscribeDisabled) {
            Promise.all(videoUrls.map(async (url) => {
                let response = await _transcribeService.getTranscribeStatus(url);
                if (response && response.body && response.body.status === "c") {
                    if(response.body.comment) {
                        response.body.comment["isTranscribe"] = true;
                        this.postComments.push(response.body.comment);
                        commentIds.push(response.body.comment._id);
                    }
                }
            })).then(async()=>{
                await this.fetchLocaleForTranscribeComments(commentIds);
            })
        }
       
    }

    async updatePostReadStatus(postContent) {
        return await _postService.updateReadStatus(postContent);
    }

}