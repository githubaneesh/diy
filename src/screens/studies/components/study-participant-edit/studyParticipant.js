import GroupService from "../../../../services/groupservice";
import UserService from "../../../../services/userservice";
import UserType from "../../../../common/userType";
import ParticipantService from "../../../../services/participantService";
import NotifierService from "../../../../services/notifierService";
import { Messages } from "../../../../utility/Messages";
import Utility from "../../../../utility/Utility";

const _groupService = GroupService.instance;
const _userService = UserService.instance;
const _participantService = ParticipantService.instance;
const _notifierService = NotifierService.instance;
let _owner;

export default class StudyParticipant {
    _studyGroups;
    _prospectUsers;

    usersFetched = false;

    constructor (owner) {
        _owner = owner;
    }

    async init(studyId, type, existingParticipants) {
        await this.fetchStudyGroups(studyId);
        _owner.refreshUI();
        if(type !== "Edit"){
            const existingUsers = existingParticipants.map(p=>p.user._id);
            await this.fetchAllProspectUsers(existingUsers);
            this.usersFetched = true;
            _owner.refreshUI();
        }
        
    }

    get studyGroups() {
        return this._studyGroups || [];
    }

    set studyGroups(groupData){
        this._studyGroups = groupData;
    }

    get prospectUsers(){
        return this._prospectUsers || [];
    }

    set prospectUsers(users){
        this._prospectUsers = users;
    }

    async fetchStudyGroups(studyId){
        const response = await _groupService.getStudyGroups(studyId);
        if(response && response.body){
            this.studyGroups = response.body;
        }
    }

    async fetchAllProspectUsers(existingUsers) {
        const response = await _userService.getAllProspectUsers();
        if (response && response.body) {
            const filteredResponse = response.body.filter( u => existingUsers.indexOf(u._id) === -1)
            
            this.prospectUsers = filteredResponse.map(user => {
                console.log(user.firstName , user.lastName)
                const { firstName, lastName} = user
                if(firstName && lastName) {
                    user.name = Utility.titleCase(`${firstName.trim()} ${lastName.trim()}`);
                } else {
                    user.name = Utility.titleCase(`${firstName.trim()}`);
                }
                return user;
            });
        }
    }

    async createParticipant(userId, studyId, groupId){
        const postContent = {
            user: userId,
            study: studyId,
            group: groupId
        }

        const response = await _participantService.createParticipant(postContent)
        if(response && response.data){
            _notifierService.showMessage(response, Messages.participant_added);
        }
    }

    async changeGroup(userId, studyId, groupId) {
        let updateSatus = true;
        const postContent = {
            user: userId,
            study: studyId,
            group: groupId
        }
        
        const response = await _participantService.changeGroup(postContent)
        if (response && response.body && typeof response.body === "string") {
            updateSatus = false;
            _notifierService.showMessage({ error: true }, '', response.body);
        }
        return updateSatus;
    }

}