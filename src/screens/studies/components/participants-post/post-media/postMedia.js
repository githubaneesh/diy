import CookieService from "../../../../../services/cookieservice";
import TagService from "../../../../../services/tagService";
import QuestionaireService from "../../../../../services/questionaireService";
import Utility from "../../../../../utility/Utility";
import MediaService from "../../../../../services/mediaservice";

const _cookieService = CookieService.instance;
const _tagService = TagService.instance;
const _questionaireService = QuestionaireService.instance;
const _mediaService = MediaService.instance;
let _owner;

export default class PostMediaController {
      
    _studyTags = [];
    _questionTags = [];
    _allTags = [];


    constructor (owner) {
        _owner = owner;
    }

    set StudyTags(tags) {
        this._studyTags = tags;
    }

    get StudyTags(){
        return this._studyTags || [];
    }

    set QuestionTags(tags) {
        this._questionTags = tags;
    }

    get QuestionTags(){
        return this._questionTags || [];
    }

    set AllTags(tags) {
        this._allTags = tags;
    }

    get AllTags(){
        return this._allTags || [];
    }

    async getAllTags(studyId) {
        await this.fetchPostTags(studyId)
        const questionTagResp = await _questionaireService.getQuestionTags(studyId);
        if (questionTagResp && !questionTagResp.error) {
            this.QuestionTags = questionTagResp.body;
        }
    }

    getDisplayableTagsForDropDown () {
        const studyTags = Utility.convertToDisplayInDropDown(this.StudyTags);
        const questionModifiedTags = Utility.convertQuestionTagsToDisplayInDropDown(this.QuestionTags);
        const allTags = questionModifiedTags.concat(studyTags);
        return allTags;
    }

    async createTag(tagName, StudyId, postId) {
        const user = _cookieService.user;
        if(user && user._id) {
            const postData ={};
            postData["name"] = tagName;
            postData["study"] = StudyId;
            postData["createdBy"] =  user._id;
            const response = await _tagService.createTags(postData);
            if(response && response.data) {
                const {_id} = response.data;
                const addTagPost = {"post": postId};
                const addTagResponse = await _tagService.addStudyTag(_id, addTagPost);
                if(addTagResponse && addTagResponse.data) {
                    await this.getAllTags(StudyId);
                }
            }
        }
    }

    async fetchPostTags(studyId) {
        const response = await _tagService.getStudyTags(studyId);
        if(response && response.data) {
            this.StudyTags = response.data;
        }
    }

    async updateMediaDescription(mediaId, text) {
        const data = {"media": mediaId, "description": text};
        const response = await _mediaService.updateMediaDescription(data);
        return response;
    }

    async AddTagToPost(tagId, PostId, studyId) {
        const studyTagIndex = this.StudyTags.findIndex(t=> t._id === tagId);
        const questionTagIndex = this.QuestionTags.findIndex(t=> t._id === tagId);
        const data= {"post": PostId};
        let response;
        if(questionTagIndex !== -1) {
             response = await _questionaireService.addQuestionTagToPost(tagId, data);
        }

        else if(studyTagIndex !== -1) {
            response = await _tagService.addStudyTag(tagId, data);
        }
        if(response && response.data) {
            await this.getAllTags(studyId);
        }
    }

    async removeTag(tagId, PostId, studyId) {
        const studyTagIndex = this.StudyTags.findIndex(t=> t._id === tagId);
        const questionTagIndex = this.QuestionTags.findIndex(t=> t._id === tagId);
        const data= {"post": PostId};
        let response;
        if(questionTagIndex !== -1) {   
            response = await _questionaireService.removeQuestionTagFromPost(tagId, data);
        }
        else  if(studyTagIndex !== -1) {
            response = await _tagService.removeStudyTag(tagId, data);
        }
       
        if (response && response.data) {
            await this.getAllTags(studyId);
        }
    }

}