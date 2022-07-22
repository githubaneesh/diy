import StudyService from "../../services/studyService";
import moment from "moment";
import ParticipantService from '../../services/participantService';
const _studyService = StudyService.instance;

let _owner;
export default class Studies {
    _studies = [];
    _participantService = ParticipantService.instance;
    _lastFetchRecordLength = 0;
    _lastSelectedStudyType = "";
    _lastSearch = null;

    constructor (owner) {
        _owner = owner;
    }

    get studies () {
        return this._studies || [];
    }

    set studies (val) {
        this._studies = val;
    }

    async archiveStudy (study, isArchived) {
        return await _studyService.archiveStudy(study, isArchived);
    }

    async getStudyDetails (study) {
        return await _studyService.getStudyDetails(study);
    }

    async getParticipantDetails (particiapant) {
        return await this._participantService.getParticipantDetails(particiapant);
    }
    
    async fetchStudies (studyType, index, searchValue, pageLimit = 5){
        studyType = studyType.toLowerCase();
        const postContent = {
            skip : index,
            limit : pageLimit,
            type: studyType,
            search: searchValue
        }
        if ((this._lastFetchRecordLength > 0) || this._lastSelectedStudyType !== studyType || this._lastSearch !== searchValue) {
            const response = await _studyService.fetchStudies(postContent)
           
            if (response && !response.error) {
                if(this._lastSearch !== searchValue) {
                    this.studies = [];
                    this.studies = response.body;
                }
                else {
                    this.studies.push(...response.body);
                }
                this.studies.map(study => {
                    study["studyDate"] = moment(study.beginsOn).format("MMMM Do YYYY");
                    return study;
                });
                this._lastFetchRecordLength = response.body.length;
                this._lastSelectedStudyType = studyType;
                this._lastSearch = searchValue;
            }
        }
    }
}