import NotifierService from "../../../../services/notifierService";
import { Messages } from "../../../../utility/Messages";
import TopicService from "../../../../services/topicservice";
import ParticipantService from "../../../../services/participantService";
import PostService from "../../../../services/postservice";
import CookieService from "../../../../services/cookieservice";
import MediaService from "../../../../services/mediaservice";
import Utility from "../../../../utility/Utility";

const _topicService = TopicService.instance;
const _notifierService = NotifierService.instance;
const _participantService = ParticipantService.instance;
const _postService = PostService.instance;
const _cookieService = CookieService.instance;
const _mediaService = MediaService.instance;

let _owner;

export default class AddPostController {
    selectedTopic = undefined;
    selectedQuestion = undefined;
    selectedGroup = undefined;
    comment = undefined;
    selectedMedia = undefined;
    selectedVideoThumbnail = undefined;
    isTextAllowed = false;
    isMediaAllowed = false;

    _studyTopics;
    _studyQuestions;
    _studyQuestionGroups;
    _groupParticipants;
    _questionPost;
    _selectedFile;
    _studyId;

    constructor (owner) {
        _owner = owner;
    }

    async init(studyId, participants, groupId){
        this.groupParticipants = participants;
        _owner.refreshUI();
        await this.fetchStudyTopics(studyId, groupId);
        this._studyId = studyId;
        _owner.refreshUI();
    }

    get studyTopics() {
        return this._studyTopics || [];
    }

    set studyTopics(topics){
        this._studyTopics = topics;
    }

    get studyQuestions(){
        return this._studyQuestions || [];
    }

    set studyQuestions(questions){
        this._studyQuestions = questions;
    }

    get studyQuestionGroups(){
        return this._studyQuestionGroups || [];
    }

    set studyQuestionGroups(groups){
        this._studyQuestionGroups = groups;
    }

    get groupParticipants(){
        return this._groupParticipants || [];
    }

    set groupParticipants(participants) {
        this._groupParticipants = participants;
    }

    get questionPost() {
        return this._questionPost || [];
    }

    set questionPost(questionPosts) {
        this._questionPost = questionPosts;
    }

    handleTopicChange(topic, type) {
        this.selectedTopic = topic.value;
        this.studyQuestions = this.studyTopics.filter(t=> t._id === topic.value)[0].questions;
        this.selectedQuestion = undefined;
        this.isMediaAllowed = false;
        this.isTextAllowed = false;
        this.comment = undefined;
        this.studyQuestionGroups = undefined;
        if(type !== "participant") {
            this.groupParticipants = [];
        }   
        _owner.refreshUI();
        _owner.setSaveButtonStatus(true);
    }

    clearTopic() {
        this.selectedTopic = undefined;
        this.isMediaAllowed = false;
        this.isTextAllowed = false;
        this.studyQuestions = [];
        this.studyQuestionGroups = undefined;
        _owner.refreshUI();
        _owner.setSaveButtonStatus(true);
    }

    async handleQuestionChange(question, type) {
        this.selectedQuestion = question.value;
        _owner.setSaveButtonStatus(true);
        await this.fetchQuestionPosts( this.selectedQuestion);
        const questionObj = this.studyQuestions.filter(q => q._id === question.value)[0];
        this.studyQuestionGroups = questionObj.group;
        this.selectedGroup =  this.studyQuestionGroups[0]._id;
        if(type !== "participant") {
            this.groupParticipants = [];
            await Promise.all(
                this.studyQuestionGroups.map(async (group)=>{
                    await this.fetchGroupPartcipants(group);
            }));
        }
       
        this.isMediaAllowed = (questionObj.responses.image === 1 || questionObj.responses.video === 1 || questionObj.responses.screenRecording === 1);
        this.isTextAllowed = questionObj.responses.text === 1;
        if(!this.isTextAllowed) {
            this.comment = undefined;
        }
        if(!this.isMediaAllowed) {
            this.selectedMedia = undefined;
            this._selectedFile = undefined;
        }
        let disableSaveBtn = (this.groupParticipants && this.groupParticipants.length === 0);
        _owner.setSaveButtonStatus(disableSaveBtn);
        _owner.refreshUI();
    }

    async fetchGroupPartcipants(group) {
        const postContent = { "group": group._id };
        const participantsResponse = await _participantService.getGroupParticipants(postContent);
        if (participantsResponse && participantsResponse.data) {
            this.groupParticipants = [...this.groupParticipants, ...participantsResponse.data];
        }
    }

    clearQuestion(type) {
        this.selectedQuestion = undefined;
        this.studyQuestionGroups = [];
        if(type !== "participant") {
            this.groupParticipants = [];
        }
        this.isMediaAllowed = false;
        this.isTextAllowed = false;
        _owner.setSaveButtonStatus(true);
        _owner.refreshUI();
    }

    async handleGroupChange(group) {
        this.selectedGroup = group.value;
        let disableSaveBtn = (this.groupParticipants && this.groupParticipants.length === 0);
        if (disableSaveBtn) {
            const groupObject = this.studyQuestionGroups.find(g => g._id === this.selectedGroup);
            if (groupObject) {
                this.groupParticipants = [];
                await this.fetchGroupPartcipants(groupObject);
            }
        }
        _owner.setSaveButtonStatus(disableSaveBtn);
        _owner.refreshUI();
    }

    clearGroup() {
        this.selectedGroup = undefined;
        _owner.refreshUI();
    }

    async fetchStudyTopics(studyId, groupId) {
        let postContent = { "study": studyId };
        if(groupId) {
            postContent["group"] = groupId;
        }
        const response = await _topicService.topicsByUserType(postContent);
        if (response && response.body) {
            this.studyTopics = response.body;
        }
    }

    async fetchQuestionPosts(questionId){
        const response = await _postService.getQuestionPost(questionId);
        console.log("response : ", response);
        if (response && response.body) {
            this.questionPost = response.body;
        }
    }

    removeParticipant(participant) {
        const participantIndex = this.groupParticipants.findIndex(g=> g._id === participant._id);
        if(participantIndex !== -1) {
            this.groupParticipants.splice(participantIndex, 1);
            let disableSaveBtn = (this.groupParticipants && this.groupParticipants.length === 0);
            if (!disableSaveBtn) {
                disableSaveBtn = this.selectedTopic === undefined || this.selectedQuestion === undefined;
            }
            _owner.setSaveButtonStatus(disableSaveBtn);
            _owner.refreshUI();
        }
    }

    commentChange(event){
        if (this.isTextAllowed && event.target.value) {
            this.comment = event.target.value;
        }
    }

    uploadMediaHandler = async(file)=>{
        this.selectedMedia = file;
        if (file.type.startsWith("video",0)) {
            let reader = new FileReader();
            reader.onload = async function(e) {
                this._selectedFile = e.target.result;
                this.selectedVideoThumbnail = await this.getVideoThumbnail(this._selectedFile, file);
                _owner.refreshUI();
            }.bind(this);
            reader.readAsDataURL(this.selectedMedia);
        }
        else if(file.type.startsWith("image",0)) {
            let reader = new FileReader();
            reader.onload = function(e) {
                this._selectedFile = e.target.result;
                _owner.refreshUI();
            }.bind(this);
            reader.readAsDataURL(this.selectedMedia);
        }
    }

    async getVideoThumbnail(videoBlob, file): Blob {

        const thumbnailImage = await new Promise((resolve, reject) => {
            try {
                let video = document.createElement("video");
                video.src = videoBlob
                video.name = file.name;
                video.addEventListener("loadedmetadata", () => {
                    
                    let canvas = document.createElement('canvas');
                    let context = canvas.getContext('2d');

                    // Set canvas dimensions same as video dimensions
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    // Set video current time to get some random image
                    video.currentTime = 0.5;

                    // Draw the base-64 encoded image data when the time updates
                    video.addEventListener("timeupdate", function () {
                        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                        let dataURI = canvas.toDataURL('image/png');
                        let blobBin = atob(dataURI.split(',')[1]);
                        let array = [];
                        for (var i = 0; i < blobBin.length; i++) {
                            array.push(blobBin.charCodeAt(i));
                        }
                        let thumbnailImageFile = new Blob([new Uint8Array(array)], { type: 'image/png' });
                        thumbnailImageFile.name = video.name.split('.')[0] + '.png';
                        resolve(thumbnailImageFile);
                    }.bind(this));
                });
            }
            catch(e) {
                console.log("error occured: ", e);
                resolve(undefined);
            }
          
        });
        return thumbnailImage;
    }

    savePost = async () => {
        const user = _cookieService.user;
        if (user && user._id) {
            let response;
            const createdBy = user._id;
            if (this.groupParticipants.constructor === Object) {
                let userPosts = [];
                if (this.questionPost || this.questionPost.length !== 0) {
                    userPosts = this.questionPost.filter(p => p.user === this.groupParticipants.user._id);
                }
                if (userPosts.length === 0) {
                    response = await this.createPost(createdBy, this.groupParticipants.user._id, this._studyId, this.selectedTopic, this.selectedQuestion);
                }
                userPosts = this.questionPost.filter(p => p.user === this.groupParticipants.user._id);
                if (this.selectedMedia) {
                    response = await this.updatePostMedia(createdBy, userPosts);
                }
                if (this.comment) {
                    response = await this.addPostComment(createdBy, userPosts);
                }
                _notifierService.showMessage(response, Messages.post_created);
                return response;

            }
            else {

                if (this.questionPost || this.questionPost.length !== 0) {
                    const participantUsers: Array = this.groupParticipants.map(u => u.user._id);
                    for (let user of participantUsers) {
                        let userPosts = this.questionPost.filter(p => p.user === user);
                        if (userPosts.length === 0) {
                            response = await this.createPost(createdBy, user, this._studyId, this.selectedTopic, this.selectedQuestion);
                            userPosts = this.questionPost.filter(p => p.user === user);
                        }

                        if (this.selectedMedia) {
                            response = await this.updatePostMedia(createdBy, userPosts);
                        }
                        if (this.comment) {
                            response = await this.addPostComment(createdBy, userPosts);
                        }
                    }

                    _notifierService.showMessage(response, Messages.post_created);
                    return response;
                }

                else {
                    const participantUsers: Array = this.groupParticipants.map(u => u.user._id);
                    let userPosts = [];
                    for (let user of participantUsers) {
                        response = await this.createPost(createdBy, user, this._studyId, this.selectedTopic, this.selectedQuestion);
                        userPosts = this.questionPost.filter(p => p.user === user);
                        if (this.selectedMedia) {
                            response = await this.updatePostMedia(createdBy, userPosts);
                        }
                        if (this.comment) {
                            response = await this.addPostComment(createdBy, userPosts);
                        }
                    }
                    _notifierService.showMessage(response, Messages.post_created);
                    return response;
                }
            }
        }
    }

    async updatePostMedia(createdBy, userPosts) {
         // Post Video Upload

         if(this.selectedMedia && this.selectedVideoThumbnail) {
            for(let post of userPosts) {
                const updatePostContent = {};
                updatePostContent["post"] = post._id;
                updatePostContent["createdBy"] = createdBy;

                const videoResponse = await this.addPostVideo(post._id);
                if(videoResponse) {
                    updatePostContent["video"] = "";
                    updatePostContent["image"] = "";
                    updatePostContent["imageObjectKey"] = this.selectedMedia.name;
                    updatePostContent["videoObjectKey"] = this.selectedMedia.name;
                    const response = await _postService.updatePost(updatePostContent);
                    if(response && response.body) {
                        post = response.body;
                    }
                }
                
            }
        }
        //Post Image Upload
        else if(this.selectedMedia) {
            for(let post of userPosts) {
                const updatePostContent = {};
                updatePostContent["post"] = post._id;
                updatePostContent["createdBy"] = createdBy;
                const uploadImageName = await this.addPostImage(post._id);
                if(uploadImageName) {
                    updatePostContent["image"] = "";
                    updatePostContent["imageObjectKey"] = uploadImageName;
                    const response = await _postService.updatePost(updatePostContent);
                    if(response && response.body) {
                        post = response.body;
                    }
                }
            }
        }

        return this.questionPost;
    }

    async addPostComment(createdBy, userPosts) {
        if (this.comment) {
            const postIds: Array = userPosts.map(q => q._id);
            let commentResponse = [];
            for (let postId of postIds) {
                const commentContent = {};
                commentContent["text"] = this.comment;
                commentContent["post"] = postId;
                commentContent["createdBy"] = createdBy;
                const response = await _postService.createComment(commentContent);
                if(response && response.body) {
                    commentResponse.push(response.body)
                }
            }
            return commentResponse;
        }
        
    }

    async createPost(createdBy, userId, studyId, topicId, questionId) {
        const postContent = {
            "user": userId,
            "createdBy": createdBy,
            "study": studyId,
            "topic": topicId,
            "questionnaire": questionId
        }

        const response = await _postService.createPost(postContent);
        if (response && response.body) {
            this.questionPost.push(response.body);
        }
        
    }

    async addPostImage(postId) {
        const filename = Utility.createUniqueFileName(this.selectedMedia.name);
        const response = await _postService.addPostImage(postId, filename);
        if(response) {
            await _mediaService.uploadMedia(response.body, this.selectedMedia, this.selectedMedia.type);
            return filename;
        }
    }

    async addPostVideo(postId) {
        const filename = Utility.createUniqueFileName(this.selectedMedia.name);
        const response = await _postService.addPostVideo(postId, filename);
        await _mediaService.uploadMedia(response.body, this.selectedMedia, this.selectedMedia.type);

        if(response) {
            const thumbnailfilename = Utility.createUniqueFileName(this.selectedVideoThumbnail.name);
            const mediaThumbnailResponse = await _postService.addPostThumbnail(postId, thumbnailfilename);
            await _mediaService.uploadMedia(mediaThumbnailResponse.body, this.selectedVideoThumbnail, this.selectedVideoThumbnail.type);
            if(mediaThumbnailResponse) {
                const videoResponse = {};
                videoResponse["video"] = "";
                videoResponse["image"] = "";
                videoResponse["imageObjectKey"] = thumbnailfilename;
                videoResponse["videoObjectKey"] = filename;
                return videoResponse;
            }
        }
    }

    handleDeleteMedia = () =>{
        this._selectedFile = undefined;
        this.selectedMedia = undefined;
        _owner.refreshUI();
    }



    
}