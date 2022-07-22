import HttpService from "./httpservice";

let _singleton = true;
let _instance;
const _httpService = HttpService.instance;

class ParticipantService {

    constructor () {
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use ParticipantService.instance instead!');
        }
    }

    static get CREATE_PARTICIPANT () { return `/participant/create`; }
    static CHANGE_GROUP () { return `/participant/changeGroup`; }
    static PARTICIPANT_DETAILS (participant) { return `/participant/${participant}`;}
    static DELETE_PARTICIPANT (participant) { return `/participant/delete/${participant}`; }
    static GROUP_PARTICIPANTS() { return `/participant`; }
    static UPDATE_PARTICIPANT(participant) { return `/participant/update/${participant}`}
    static PARTICIPANT_POST_COUNT(participant) { return `/study/participants/participantpostcount/${participant}` }
    static PRINT_PARTICIPANT_POST_COMMENTS (studyId, participantId) { return `/print/study/participant/post/comments/${studyId}/${participantId}`; }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new ParticipantService();
            _singleton = true;
        }
        return _instance;
    }

    async createParticipant(postContent) {
        const requestUrl = ParticipantService.CREATE_PARTICIPANT;
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async deleteParticipant(participant) {
        const requestUrl = ParticipantService.DELETE_PARTICIPANT(participant);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, null);        
    }

    async changeGroup(postContent) {
        const requestUrl = ParticipantService.CHANGE_GROUP();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async getGroupParticipants(postContent){
        const requestUrl = ParticipantService.GROUP_PARTICIPANTS();
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async getParticipantDetails (participant) {
        const requestUrl = ParticipantService.PARTICIPANT_DETAILS(participant);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, null);        
    }
    async updateParticipant (participant, postContent) {
        const requestUrl = ParticipantService.UPDATE_PARTICIPANT(participant);
        return await _httpService.requestV1Server(HttpService.POST, requestUrl, postContent);
    }

    async getParticipantCount(participant) {
        const requestUrl = ParticipantService.PARTICIPANT_POST_COUNT(participant);
        return await _httpService.requestV1Server(HttpService.GET, requestUrl, null);
    }

    async getParticipantPostComment (studyId, participantId) {
        const requestUrl = ParticipantService.PRINT_PARTICIPANT_POST_COMMENTS(studyId, participantId);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }

}
export default ParticipantService;