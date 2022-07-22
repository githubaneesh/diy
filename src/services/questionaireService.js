import HttpService from "./httpservice";
let _singleton = true;
let _instance;
const _httpService = HttpService.instance;

class QuestionaireService {
    constructor () {
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use QuestionaireService.instance instead!');
        }
    }

    static ADD_QUESTION () { return '/diy/questionnaire/create'; }
    static UPDATE_QUESTION(questionId) { return `/diy/questionnaire/update/${questionId}`;}
    static COPY_QUESTION_TO_GROUP () { return `/group/copy/question`; }
    static REORDER_QUESTIONNAIRE() {return '/group/questionnaire/reorder';}
    static TOPICS_FOR_QUESTIONNAIRE_COPY(study, group) {return `/diy/group/topics/${study}/${group}`}
    static COPY_QUESTION_TO_TOPIC() {return `/group/questionnaire/copy`}
    static DELETE_QUESTION(id) {return `/questionnaire/delete/${id}`}
    static ADD_QUESTION_MEDIA(id) { return `/questionnaire/${id}/media/upsert`}
    static DELETE_QUESTION_MEDIA(questionId, mediaId) { return `/questionnaire/${questionId}/media/${mediaId}/delete`}
    static QUESTION_POST(questionId) {return `/questionPost/${questionId}`; }
    static GET_STUDY_QUESTION_TAGS(studyId) { return `/study/questionnaire/get/${studyId}`; }
    static ADD_QUESTIONAIRE_TAG(questionId) { return `/study/questionnaire/tag/addtext/${questionId}`; }
    static REMOVE_QUESTIONAIRE_TAG(questionId) { return `/study/questionnaire/tag/removetext/${questionId}`; }
    static ADD_QUESTION_TAG_TO_POST(tagId) { return `/study/questionnaire/tag/addpost/${tagId}`; }
    static REMOVE_QUESTION_TAG_FROM_POST(tagId) { return `/study/questionnaire/tag/removepost/${tagId}`; }
    static GET_QUESTIONNAIRE_BY_GROUP(studyId, groupId) { return `/study/questionnaire/get/${studyId}/${groupId}`; }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new QuestionaireService();
            _singleton = true;
        }
        return _instance;
    }

    async addQuestion(postContent) {
        const requestUrl = QuestionaireService.ADD_QUESTION();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);        
    }

    async deleteQuestion(_id, groupId) {
        const requestUrl = QuestionaireService.DELETE_QUESTION(_id);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, {group: groupId});
    }

    async updateQuestion(questionid, postContent) {
        const requestUrl = QuestionaireService.UPDATE_QUESTION(questionid);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);        
    }

    async addQuestionMedia(id, mediaFileContent){
        const requestUrl = QuestionaireService.ADD_QUESTION_MEDIA(id)
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, mediaFileContent);
    }

    async deleteQuestionMedia(questionId, mediaId){
        const requestUrl = QuestionaireService.DELETE_QUESTION_MEDIA(questionId, mediaId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, null);
    }

    async updateQuestionsOrder (postContent) {
        const requestUrl = QuestionaireService.REORDER_QUESTIONNAIRE();

        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async topicsForQuestionCopy(study, group){
        const requestUrl = QuestionaireService.TOPICS_FOR_QUESTIONNAIRE_COPY(study, group);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }


    async copyQuestionToTopic(postContent){
        const requestUrl = QuestionaireService.COPY_QUESTION_TO_TOPIC();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async questionPost(questionId) {
        const requestUrl = QuestionaireService.QUESTION_POST(questionId);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }

    async getQuestionTags(studyId) {
        const requestUrl = QuestionaireService.GET_STUDY_QUESTION_TAGS(studyId);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
        //return await _httpService.requestV1Server(HttpService.POST, requestUrl, null);
    }

    async addQuestionaireTag(questionId, postContent) {
        const requestUrl = QuestionaireService.ADD_QUESTIONAIRE_TAG(questionId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
        //return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }
    
    async removeQuestionaireTag(questionId, postContent) {
        const requestUrl = QuestionaireService.REMOVE_QUESTIONAIRE_TAG(questionId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
        //return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async addQuestionTagToPost(tagId, postContent) {
        const requestUrl = QuestionaireService.ADD_QUESTION_TAG_TO_POST(tagId);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async removeQuestionTagFromPost(tagId, postContent) {
        const requestUrl = QuestionaireService.REMOVE_QUESTION_TAG_FROM_POST(tagId)
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async getQuestionnaireByGroup(studyId, groupId) {
        const requestUrl = QuestionaireService.GET_QUESTIONNAIRE_BY_GROUP(studyId,groupId);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }

}

export default QuestionaireService;