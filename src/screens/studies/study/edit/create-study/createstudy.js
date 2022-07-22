import GroupService from "../../../../../services/groupservice";
import StudyService from '../../../../../services/studyService';
import NotifierService from '../../../../../services/notifierService';
import OrganizationService from "../../../../../services/organizationservice";
import { Messages } from "../../../../../utility/Messages";
import TranscribeLanguageService from "../../../../../services/transcribelanguageservice";

const _studyService = StudyService.instance;
const _notifierService = NotifierService.instance;
const _groupService = GroupService.instance;
const _organizationService = OrganizationService.instance;
const _transcribeLanguageService = TranscribeLanguageService.instance;

class CreateStudyController {
    _studyGroups = [];
    _studyParticipants = [];
    _organizations = [];
    _studyList = [];
    _transcribeLanguages = [];

    set StudyGroups(groups) {
        this._studyGroups = groups;
    }

    get StudyGroups() {
        return this._studyGroups || [];
    }

    set StudyParticipants(participants) {
        this._studyParticipants = participants;
    }

    get StudyParticipants(){
        return this._studyParticipants || [];
    }

    set Organizations(organizations){
        this._organizations = organizations;
    }

    get Organizations(){
        return this._organizations || [];
    }

    get StudyList(){
        return this._studyList || [];
    }

    set StudyList(studies){
        this._studyList = studies;
    }

    get transcribeLanguages() {
        return this._transcribeLanguages || [];
    }

    set transcribeLanguages(languages) {
        this._transcribeLanguages = languages;
    }

    async getTranscribeLanguages () {
        const transcribeLanguageResponse = await _transcribeLanguageService.getTranscribeLanguages();
        if (!transcribeLanguageResponse.error) {
            this.transcribeLanguages = transcribeLanguageResponse.body;
        }
    }

    async fetchStudyGroups(study) {
        const response = await _groupService.getStudyGroups(study);
        _notifierService.showMessage(response);
       
        if(response && response.body){

            this.StudyGroups = response.body;
        }
    }

    async getStudyDetails(id) {
        const response = await _studyService.getStudyDetails(id);
        return response.body;
    }

    async updateStudy(id, currentStudy) {
        const postContent = {
          client: currentStudy.organization.value,
          name: currentStudy.name,
          beginsOn: currentStudy.date,
          brandImageUrl: currentStudy.studyImage,
          description: currentStudy.objective,
          imageObjectKey: currentStudy.imageObjectKey
        };
        const response = await _studyService.updateStudy(id, postContent);
        _notifierService.showMessage(response, Messages.study_updated);
        return response.body;
    }
  
    async createStudy(currentStudy) {
        const postContent = {
            client: currentStudy.organization.value,
            name: currentStudy.name,
            beginsOn: currentStudy.date,
            brandImageUrl: currentStudy.studyImage,
            description: currentStudy.objective,
            imageObjectKey: currentStudy.imageObjectKey
          };
        const response = await _studyService.createStudy(postContent);
        _notifierService.showMessage(response);
        return response;
    }

    async getStudyName(id) {
        const response = await _studyService.getStudyName(id);
        return response.body.name;
    }

    async getOrganizations(){
        const response = await _organizationService.getOrganizations();
        console.log("response : ", response);
        _notifierService.showMessage(response);
        if(response && response.body){
            this.Organizations = response.body;
        }
        
        return response;
    }

    async getStudyPartcipants(studyId){
        const response = await _studyService.getStudyParticipants(studyId);
        _notifierService.showMessage(response);
        if(response && response.body){
            this.StudyParticipants = response.body;
            this.StudyParticipants.map((participant)=>{
                if(participant.group){
                    let groupIndex = this.StudyGroups.findIndex((g)=>g._id === participant.group._id);
                    if(groupIndex !== -1){
                        participant.group["position"] = groupIndex + 1;
                    }
                }
                participant.user["location"] = `${participant.user.city ? participant.user.city : ''}${participant.user.state ? ', ' + participant.user.state : ''}`;
                participant.user["fullLocation"] = `${participant.user.city ? participant.user.city : ''}${participant.user.state ? ', ' + participant.user.state : '' }${participant.user.country ? ', ' + participant.user.country : '' }`
                participant["acceptStatus"] = participant.status ? participant.status : false;
                participant["rejectStatus"] = participant.status === null ||  participant.status === undefined ? false : !participant.status;
                return participant;
            })
        }
       
        console.log("StudyParticipants : ", this.StudyParticipants)
    }

    async updateStudyParticipantStatus(participantId, updatedParticipantStatus){
        const response = await _studyService.updateParticipantStatus(participantId, updatedParticipantStatus);
        _notifierService.showMessage(response);
        return response;
    }

    async createGroup(studyId, data) {
        const requestBody = {
            study: studyId,
            name: data.name,
            introduction: data.introduction,
            notes: data.notes,
            criteria: JSON.stringify(data.criteria)
        }

        const response = await _groupService.createGroup(requestBody);
        console.log("response : ", response);
        _notifierService.showMessage(response);
        if(response && response.body){
            response.body.participants = response.body.participants ? response.body.participants : 0;
            response.body.criteria = JSON.parse(response.body.criteria);
            this._studyGroups.push(response.body);
        }
        
        return response;
    }

    async getStudies(){
        const response = await _studyService.getStudyList();
        _notifierService.showMessage(response);
        if (response && response.body) {
          this.StudyList = response.body;
        }
    }

    /**
     * This will copy only study name and returns the new generated studyId 
     * @param {*} sourceStudyId previous study Id to copy
     */
    async copyStudy(sourceStudyId){
        const response = await _studyService.copyStudy(sourceStudyId);
        _notifierService.showMessage(response);
        return response;
    }

    /**
     * This will copy study content into given destStudyId
     * @param {*} sourceStudyId  previous study Id to copy
     * @param {*} destStudyId new generated studyId or destination studyId 
     */
    async copyStudyContent(sourceStudyId, destinationStudyid){
        const response = await _studyService.copyStudyContent(sourceStudyId, destinationStudyid);
        _notifierService.showMessage(response, Messages.study_copy);
        return response;
    }

    async updateGroup(group, data){
        const requestBody = {
            name: data.name,
            notes: data.notes,
            criteria: JSON.stringify(data.criteria)
        }

        const response = await _groupService.updateGroup(group, requestBody);
        _notifierService.showMessage(response);

        let index = this._studyGroups.findIndex((g)=>g._id === group);
        response.body.criteria = JSON.parse(response.body.criteria);
        Object.assign(this._studyGroups[index], response.body);
        return response;
    }

    async deleteGroup(studyId, GroupId){
        const response = await _groupService.deleteGroup(studyId, GroupId);
        _notifierService.showMessage(response);
        let groupIndex = this._studyGroups.findIndex((g)=>g._id === GroupId)
        this._studyGroups.splice(groupIndex, 1);
        return response;
    }

    async downloadTagList(studyId){
        const response = await _studyService.downloadTagList(studyId);
        _notifierService.showMessage(response);
        return response;
    }

    async uploadTagList(type, studyId, data){
        let formData = new FormData();
        formData.append("questionnaire", data.file);
        formData.append("createdBy", data.createdBy);
        const response = await _studyService.uploadTagList(type, studyId, formData);
        _notifierService.showMessage(response, Messages.tag_list_uploaded);
        return response;
    }
    async updateTaglistName(id, name) {
        const postContent = {
            taglistName: name
          };
          const response = await _studyService.updateStudy(id, postContent);
          if(response.error) {
            _notifierService.showMessage({error:true}, '', Messages.error_taglist_update);
          }
          return response.body;        
    }

    async deleteTagList(studyId){
        const response = await _studyService.uploadTagList("delete", studyId, null);
        _notifierService.showMessage(response, Messages.tag_list_delete);
        return response;
    }

    async updateStudyTranscribeLanguage(studyId, languageId, previousLanguageId) {
        let selectedLanguage = languageId === "noLanguage" ? null : languageId;
        let previousLanguage =  previousLanguageId === "noLanguage" ? null : previousLanguageId;
        const body = { language: selectedLanguage, previousLanguage };
        const response = await _studyService.updateStudyTranscribeLanguage(studyId, body);
        _notifierService.showMessage(response, Messages.transcribe_language_updated);
    }

    async disableTranscribe(studyId,shouldDisabled) {
        return await _studyService.disableTranscript(studyId, {'shouldDisabled': shouldDisabled});
    }

    async createOrganization(organizationName){
        const postData = {"name": organizationName};
        const response = await _organizationService.createOrganization(postData);
        _notifierService.showMessage(response);
        if (response && response.data) {
            const organization = { "_id": response.data._id, "name": response.data.name };
            this._organizations.push(organization);
        }
        return response;
    }

}

export default CreateStudyController;