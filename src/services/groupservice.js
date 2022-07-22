import HttpService from "./httpservice";
import moment from "moment";
let _singleton = true;
let _instance;
const _httpService = HttpService.instance;
class GroupService {
    static STUDY_GROUPS(study) { return `/study/${study}/groups`; }
    static GROUP_TOPICS(study, group) { return `/study/${study}/group/${group}/topics`; }
    static UPDATE_GROUP(group) { return `/group/update/${group}`; }
    static COPY_INTRUCTIONS_TO_GROUP() { return `/group/copy/instructions`; }
    static COPY_QUESTION_TO_GROUP() { return `/group/copy/question`; }
    static CREATE_GROUP() { return `/group/create`; }
    static DELETE_GROUP(study, group) { return `/study/${study}/group/delete/${group}`; }

    constructor() {
        if (_singleton) {
            throw new SyntaxError('This is a singleton class. Please use GroupService.instance instead!');
        }
    }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new GroupService();
            _singleton = true;
        }
        return _instance;
    }

    async getStudyGroups(study) {
        const requestUrl = GroupService.STUDY_GROUPS(study);
        const response = await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
        let criterias = ["ageRange", "gender", "geography", "behavior", "groupSize"];
        if (response && !response.error && response.body && response.body.length > 0) {
            for (let group of response.body) {
                if(group.criteria){
                    group.criteria = JSON.parse(group.criteria);
                    criterias.forEach(criteria=>{
                        if(!group.criteria[criteria]){
                            group.criteria[criteria] = { selected:false, value: '' }
                        }
                    });
                }
                else{
                    group.criteria = {
                        ageRange: { selected:false, value: '' },
                        gender: { selected: false, value: '' },
                        geography: { selected: false, value: '' },
                        behavior: {selected: false, value: '' },
                        groupSize: {selected: false, value: '' }
                    };
                }
                group["createdAtMoment"] = moment(group.createdAt, [moment.ISO_8601])
            }
            response.body = response.body.sort((a, b) => a.createdAtMoment.isBefore(b.createdAtMoment) ? -1 : a.createdAtMoment.isAfter(b.createdAtMoment) ? 1 : 0);
        }
        return response;
    }

    async getGroupTopics(study, group) {
        const requestUrl = GroupService.GROUP_TOPICS(study, group);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }

    async updateGroup(group, postContent) {
        const requestUrl = GroupService.UPDATE_GROUP(group);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    /**
     * 
     * @param {object} postContent 
     * postcontent will be array of groupId where instructions should copy
     * instruction content will be copied from auto save api, no need to pass here
     * postContent: {
	            "source": "5d09d1f2b23d5da134a8e5a5",
	            "destination": [
		            "5ddbbc30841b7dae886076d7",
		            "5ddbbc37841b7dae886076d8"]
            }
     */
    async copyInstrunctionsToGroup(postContent) {
        const requestUrl = GroupService.COPY_INTRUCTIONS_TO_GROUP();
        return await _httpService.requestV3Server( HttpService.POST, requestUrl, postContent);
    }

    async copyQuestionToGroup(postContent) {
        const requestUrl = GroupService.COPY_QUESTION_TO_GROUP();
        return await _httpService.requestV3Server(HttpService.POST,requestUrl, { postContent });
    }

    async createGroup(postContent) {
        const requestUrl = GroupService.CREATE_GROUP();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async deleteGroup(studyId, groupId){
        const requestUrl = GroupService.DELETE_GROUP(studyId, groupId);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, null);
    }

}
export default GroupService;