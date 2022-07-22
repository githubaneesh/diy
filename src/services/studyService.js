import HttpService from "./httpservice";
import moment from "moment";
import Settings from "../config/settings";

let _singleton = true;
let _instance;

const _httpService = HttpService.instance;

export default class StudyService {
    static STUDY_NAME (id) { return `/study/${id}/name`; }
    static STUDY_DETAILS (id) { return `/study/${id}/all`; }
    static UPDATE_STUDY (id) { return `/study/${id}/update`; }
    static STUDY_PARTICIPANTS(studyId) { return `/study/participants/${studyId}`}
    static UPDATE_PARTCIPANT_STATUS(participantId) { return `/participant/${participantId}/update/status`; }
    static STUDY_LIST() { return `/study/list`; }
    static COPY_STUDY(sourceStudyId) { return `/diy/study/${sourceStudyId}/copy`}
    static COPY_STUDY_CONTENT(sourceStudyId, destStudyId) { return `/diy/study/${sourceStudyId}/${destStudyId}/content/copy`; }
    static DOWNLOAD_TAG_LIST(studyId) { return `/study/export_sample/${studyId}`}
    static UPLOAD_TAG_LIST(type, studyId) { return `/study/questionnaire/${type}/${studyId}`; }
    static DELETE_TAG_LIST(studyId) { return `/study/questionnaire/${studyId}`; }
    static CREATE_STUDY () { return `/study/create`; }
    static FETCH_USER_STUDIES () { return `/study`; }
    static UPDATE_STUDY_V1 (id) { return `/study/update/${id}`; }
    static STUDY_GROUPS (id) { return `/study/${id}/groups`; }
    static UPDATE_STUDY_TRANSCRIBE_LANGUAGE (id) { return `/study/${id}/update/transcribeLanguage`; }
    static DISABLE_TRANSCRIPT(studyId){return `/study/${studyId}/disable/transcribe`;}

    constructor(){
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use StudyService.instance instead!');
        }        
    }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new StudyService();
            _singleton = true;
        }
        return _instance;
    }

    async getStudyDetails(id) {
        const requestUrl = StudyService.STUDY_DETAILS(id);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }

    async getStudyName (id) {
        const requestUrl = StudyService.STUDY_NAME(id);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }    

    async getStudyParticipants (studyId){
        const requestUrl = StudyService.STUDY_PARTICIPANTS(studyId);
        const response = await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
        if (response && !response.error && response.body && response.body.length > 0) {
            for (let participant of response.body) {
                participant.postCount = participant.sendPosts + participant.recievedPosts;
                isNaN(participant.postCount) && (participant.postCount = 0);
                if (participant.user) {
                    participant.user["name"] = participant.user["firstName"] + ' ' + participant.user["lastName"];
                    participant.user["genderVal"] = participant.user.gender;
                    if (participant.user.birthdate) {
                        participant.user["birthdateMoment"] = moment(participant.user.birthdate, [moment.ISO_8601])
                        participant.user["age"] = moment().diff(participant.user["birthdateMoment"], 'years')
                    }
                }
               
            }
        }
        return response;
    }

    async updateParticipantStatus(participantId, updateParticipantStatus){
        const requestUrl = StudyService.UPDATE_PARTCIPANT_STATUS(participantId);
        const requestBody = {
            status: updateParticipantStatus
        }
        return await _httpService.requestV3Server(HttpService.POST, requestUrl,requestBody);
    }

    async getStudyList(){
        const requestUrl = StudyService.STUDY_LIST();
        return await _httpService.requestV3Server(HttpService.GET, requestUrl,null);
    }

    /**
     * This api will copy only study name and returns the new generated studyId 
     * @param {previous study Id to copy} sourceStudyId 
     */
    async copyStudy(sourceStudyId){
        const requestUrl = StudyService.COPY_STUDY(sourceStudyId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl,null);
    }
    /**
     * This api will copy study content into given destStudyId
     * @param {*} sourceStudyId  previous study Id to copy
     * @param {*} destStudyId new generated studyId or destination studyId 
     */
    async copyStudyContent(sourceStudyId, destStudyId){
        const requestUrl = StudyService.COPY_STUDY_CONTENT(sourceStudyId, destStudyId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl,null);
    }

    async downloadTagList(studyId){
        const requestUrl = StudyService.DOWNLOAD_TAG_LIST(studyId);
        const response = await _httpService.requestV1Server(HttpService.POST, requestUrl,null);
        if(response && response.error === null && response.data){
            response["tag_list_url"] = Settings.TagListFileUrl(response.data);
        }
        return response;
    }

    async deleteTagList(studyId){
        const requestUrl = StudyService.DELETE_TAG_LIST(studyId);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl,null);
    }

    async uploadTagList(type, studyId, postContent){
        const requestUrl = HttpService.API_V1 + StudyService.UPLOAD_TAG_LIST(type, studyId);
        return await _httpService.requestV1Server(HttpService.POST, StudyService.UPLOAD_TAG_LIST(type, studyId), postContent, {'Content-Type': 'multipart/form-data'});
    }


    /**
     * This api will update study
     * @param studyId string of study id
     * @param postContent {
         client: ORGANIZATION_ID,
         name,
         beginsOn,
         brandImageUrl* 
     * }
     */
    async updateStudy(studyId, postContent) {
        const requestUrl = StudyService.UPDATE_STUDY(studyId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);        
    }

    async createStudy(postContent){
        const requestUrl = StudyService.CREATE_STUDY();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async fetchStudies (postContent = {}) {
        return await _httpService.requestV3Server(HttpService.POST, StudyService.FETCH_USER_STUDIES() ,postContent);
    }

    async archiveStudy (study, isArchived) {
        const requestUrl = StudyService.UPDATE_STUDY_V1(study);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl ,{isArchived});
    }

    async getStudyGroups(study) {
        const requestUrl = StudyService.STUDY_GROUPS(study);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }

    async updateStudyTranscribeLanguage(study, body) {
        const requestUrl = StudyService.UPDATE_STUDY_TRANSCRIBE_LANGUAGE(study);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, body);
    }

    async disableTranscript(study,body) {
        const requestUrl = StudyService.DISABLE_TRANSCRIPT(study);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, body);
    }

}