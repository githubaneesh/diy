import StudyService from "../../../services/studyService";
import ParticipantService from "../../../services/participantService";
import TagService from "../../../services/tagService";
import UserService from "../../../services/userservice";
const _studyService = StudyService.instance;
const _participantService = ParticipantService.instance;
const _tagService = TagService.instance;
const _userService = UserService.instance;
let _owner;

export default class StudyController {
    
    _studyParticipants = [];
    _studyGroups = [];
    _studyTags = [];
    _locations = {US:[]};
    sorted = false;
   
    constructor (owner) {
        _owner = owner;
    }

    set StudyParticipants(participants) {
        this._studyParticipants = participants;
    }

    get StudyParticipants(){
        return this._studyParticipants || [];
    }

    set StudyGroups(groups) {
        this._studyGroups = groups;
    }

    get StudyGroups(){
        return this._studyGroups || [];
    }

    set StudyTags(tags) {
        this._studyTags = tags;
    }

    get StudyTags(){
        return this._studyTags || [];
    }

    async fetchStudyParticipants(studyId){
        const response = await _studyService.getStudyParticipants(studyId);
        if(response && response.body){
            this.StudyParticipants = response.body;
            this.sortParticipant("name", false);
        }
    }

    sortParticipant(key, refresh = true){
        
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
        if(refresh) {
            _owner.refreshUI();
        }
    }

    async getStudyDetails (study) {
        return await _studyService.getStudyDetails(study);
    }

    async getParticipantDetails (participant) {
        const response = await _participantService.getParticipantDetails(participant);
        return response;
    }

    async getStudyGroups (study) {
        return await _studyService.getStudyGroups(study);
    }

    async getStudyTags (study) {
        return await _tagService.getStudyTags(study);
    }

    async saveEditedStudyTag (tag) {
        return await _tagService.saveEditedTag(tag._id, tag);
    }

    async deleteStudyTag (tagId) {
        return await _tagService.deleteTag(tagId);
    }
    async archiveStudy (study, isArchived) {
        return await _studyService.archiveStudy(study, isArchived);
    }

    async fetchAssignedStudies (studyType){
        const postContent = {type: studyType.toLowerCase()}
        const response = await _studyService.fetchStudies(postContent)
        if (response && !response.error) {
            return response.body;
        }
        return null;
    }
}