import UserService from "../../services/userservice";
import NotifierService from "../../services/notifierService";
import StudyService from "../../services/studyService";
import { Messages } from "../../utility/Messages";
import OrganizationService from "../../services/organizationservice";
import GroupService from "../../services/groupservice";
import MediaService from "../../services/mediaservice";
import Utility from "../../utility/Utility";
import moment from "moment";
import OccupationService from "../../services/occupationservice";

const _userService = UserService.instance;
const _notifierService = NotifierService.instance;
const _studyService = StudyService.instance;
const _organizationService = OrganizationService.instance;
const _groupService = GroupService.instance;
const _mediaService =  MediaService.instance;
const _occupationService = OccupationService.instance;

class UserController {
    _users = [];
    _userCount = "-";
    _studyList = [];
    _studyGroups = [];
    _occupationList = [];
    _participationList = [];
    _userRoles = [];
    _organizationList = [];
    _lastFetchRecordLength = 0;
    _lastSelectedOptions = {};
    _lastSelectedUserType = "all";
    _lastSortKey = '';
    _sorted = true;
    _locations = {US:[]};
    _selectedOptions = {};
    set Users(users){
        return this._users = users
    }

    get Users(){
        return this._users || [];
    }
    get TotalUserCount() {
        return this._userCount || 0;
    }

    set LastSortKey(key){
        return this._lastSortKey = key
    }

    get LastSortKey(){
        return this._lastSortKey;
    }

    set StudyList(studyList){
        return this._studyList = studyList
    }

    get StudyList(){
        return this._studyList || [];
    }

    get OccupationList(){
        return this._occupationList || [];
    }

    set OccupationList(occupationList){
        return this._occupationList = occupationList
    }

    get ParticipantList() {
        return this._participationList;
    }

    set ParticipantList(participantlist) {
        this._participationList = participantlist;
    }

    get UserRoles(){
        return this._userRoles || [];
    }

    set UserRoles(roles){
        this._userRoles = roles;
    }

    get OrganizationList(){
        return this._organizationList || []
    }

    set OrganizationList(organizations){
        this._organizationList = organizations;
    }

    get StudyGroups(){
        return this._studyGroups || [];
    }
    set StudyGroups(groups){
        this._studyGroups = groups;
    }

    async getUserCount(userType = 'all', postContent) {
        const response = await _userService.getUserCount(postContent, userType);
        _notifierService.showMessage(response);
        const booResponse = response && !response.error  && (Object.keys(response.body.options).length === 0 || JSON.stringify(this._selectedOptions) === JSON.stringify(response.body.options));
        if (booResponse) {
            this._userCount = response.body.count;
        }

        this.setState({refresh: !this.state.refresh});
        return booResponse;
    }

    async fetchUsers(index, pageLimit = 50, userType = 'all', selectedOptions){
        this._selectedOptions = selectedOptions;
        const postContent = {
            skip : index,
            limit : pageLimit,
            options: selectedOptions
        }
        if ((this._lastFetchRecordLength > 0) || (this._lastSelectedOptions !== selectedOptions || this._lastSelectedUserType !== userType)) {
            this.setState({refresh: !this.state.refresh});
            const response = await _userService.getUserList(postContent, userType);
            _notifierService.showMessage(response);
            if (response && !response.error && (Object.keys(response.body.options).length === 0 || JSON.stringify(this._selectedOptions) === JSON.stringify(response.body.options))) {
                // if fetching users for first time then only get the count and location
                // to avoid multiple count or location api call on scroll
                if (this.Users.length <= 0) {
                    this.getUserCount(userType, { options: selectedOptions });
                    // if(!booResponse) return;
                    this.fetchLocations();
                }
                this.Users.push(...response.body.data);
                this.Users.map(user => {
                    if ((!user.city && !user.state && !user.country) && user.location) {
                       let userLocation = this._locations.US[`${user.location[1]},${user.location[0]}`];
                        user["state"] = userLocation.s;
                        user["city"] = userLocation.c;
                    }
                    user["createdAt"] = moment(user.createdAt).format("MM/DD/YYYY");
                    return user;
                });
                this.sortData(undefined, false);
                this._lastFetchRecordLength = response.body.data.length;
                this._lastSelectedUserType = userType;
                this._lastSelectedOptions = selectedOptions;
            }
        }
        
    }

    async downloadProspectUsers(selectedOptions) {
        this._selectedOptions = selectedOptions;
        const postContent = {
            options: selectedOptions
        }
        return await _userService.downloadProspectUsers(postContent);
    }

    async fetchLocations(){
        if(this._locations && this._locations.US && this._locations.US.length === 0){
            const locations = await _userService.getLocations();
            this._locations = locations;
        }
    }

    sortData(sortKey, resetSorting = true) {
        this.LastSortKey = sortKey ? sortKey : this.LastSortKey;
        if(resetSorting){
            this._sorted = !this._sorted
        }
        
        if (this.LastSortKey) {
            if (!this._sorted) {
                // ascending sort
                this.Users.sort((a, b) => {
                    if (this.LastSortKey !== 'createdAt') {
                        if (this.LastSortKey === 'firstName') {
                            return a[this.LastSortKey].localeCompare(b[this.LastSortKey]) || a["lastName"].localeCompare(b["lastName"]);
                        }
                        return a[this.LastSortKey].localeCompare(b[this.LastSortKey])
                    }
                    else {
                        return new Date(a[this.LastSortKey]) - new Date(b[this.LastSortKey]);
                    }
                })
            }
            else {
                // descending sort
                this.Users.sort((a, b) => {
                    if (this.LastSortKey !== 'createdAt') {
                        if (this.LastSortKey === 'firstName') {
                            return b[this.LastSortKey].localeCompare(a[this.LastSortKey]) || b["lastName"].localeCompare(a["lastName"]);
                        }
                        return b[this.LastSortKey].localeCompare(a[this.LastSortKey]);
                    }
                    else {
                        return new Date(b[this.LastSortKey]) - new Date(a[this.LastSortKey]);
                    }
                });
            }
        }
    }

    async getStudies(){
        const response = await _studyService.getStudyList();
        _notifierService.showMessage(response);
        if (response && response.body) {
          this.StudyList = response.body;
        }
    }

    async getOccupations(){
        const response = await _occupationService.getOccupationList();
        _notifierService.showMessage(response);
        if (response && response.data) {
            this.OccupationList = response.data.sort((a, b) => a.localeCompare(b));
        }
    }

    async createOccupation(name){
        const response = await _occupationService.createOccupation(name);
        _notifierService.showMessage(response);
        if (response && response.data) {
            this.OrganizationList = response.data;
        }
    }

    async createOrganization(organizationName){
        const postData = {"name": organizationName};
        const response = await _organizationService.createOrganization(postData);
        _notifierService.showMessage(response);
        if (response && response.data) {
            const organization = { "_id": response.data._id, "name": response.data.name };
            this.OrganizationList.push(organization);
        }
        return response;
    }

    async applyUserTableFilter(selectedOptions, index, pageLimit = 50, userType = 'all'){
        console.log("Valid UserFilter : ", selectedOptions);
        this.Users = [];
        this._selectedOptions = selectedOptions;
        const postContent = {
            skip : index,
            limit : pageLimit,
            options: selectedOptions
        }
        if ((this._lastFetchRecordLength > 0) || (this._lastSelectedOptions !== selectedOptions) || this._lastSelectedUserType === userType) {

            const response = await _userService.getUserList(postContent, userType)
            _notifierService.showMessage(response);
            this._userCount = "-";
            
            if(response && !response.error && (Object.keys(response.body.options).length === 0 || JSON.stringify(this._selectedOptions) === JSON.stringify(response.body.options))){
                this.getUserCount(userType, { options: selectedOptions });
                this.fetchLocations();
                this.Users = response.body.data;
                this.Users = this.Users.map(user => {
                    if ((!user.city && !user.state && !user.country) && user.location) {
                        let userLocation = this._locations.US[`${user.location[1]},${user.location[0]}`];
                        user["state"] = userLocation.s;
                        user["city"] = userLocation.c;
                    }
                    user["createdAt"] = moment(user.createdAt).format("MM/DD/YYYY");
                    return user;
                });
                this.sortData(undefined, false);
                this._lastFetchRecordLength = response.body.data.length;
                this._lastSelectedUserType = userType;
                this._lastSelectedOptions = selectedOptions;
            }
        }
       
    }

    async updateUser(user, content){
        if(Object.keys(content).length) {
            const response = await _userService.updateUser(user, content);
            _notifierService.showMessage(response, Messages.user_updated);
            if(response && response.body){
                const userIndex = this.Users.findIndex(u=>u._id === user);
                this.Users[userIndex] = response.body;
            }
            return response;
        }
        else {
            _notifierService.showMessage({error:false}, Messages.user_updated);
            return {body:{_id: user}};
        }

    }

    async getUserDetails(user) {
        const arrKey = ["firstName", "lastName", "country", "state", "city", "ethnicity", "occupation", "gender"];
        let response = await _userService.getUserDetails(user);
        if (response && !response.error) {
            await this.fetchLocations();
            let userData = response.body
            for (const userKey of arrKey){
                try {
                    if (userData[userKey] && userData[userKey] !==  null && userData[userKey] !== "" && userData[userKey] === userData[userKey].toLowerCase()){
                        userData[userKey] = Utility.titleCase(userData[userKey]);
                    }
                } catch (error) {
                    
                }
            }
            if ((!userData.city && !userData.state && !userData.country) && userData.location) {
                let userLocation = this._locations.US[`${userData.location[1]},${userData.location[0]}`];
                userData["state"] = userLocation.s;
                userData["city"] = userLocation.c;
                response["data"] = userData;
            }
        }
        return response;
    }

    async getUserParticipationList(postContent) {
        const response = await _userService.getUserParticipationList(postContent);
        this.ParticipantList = response.data;
        if (!response.error) {
            await this.fetchLocations();
            this.ParticipantList.map(participant=>{
                if ((!participant.user.city && !participant.user.state && !participant.user.country) && participant.user.location) {
                    let userLocation = this._locations.US[`${participant.user.location[1]},${participant.user.location[0]}`];
                    participant.user["State"] = userLocation.s;
                    participant.user["City"] = userLocation.c;
                 }
                return participant;
            })
           
        }
        return response;
    }

    async getUserRoles(){
        const response = await _userService.getUserRoles();
        _notifierService.showMessage(response);
        if (response && response.data) {
            this.UserRoles = response.data;
        }
    }

    async createUser(userData) {
        const response = await _userService.createUser(userData);
        _notifierService.showMessage(response, Messages.user_add);
        return response;
    }

    async deleteChildren(childrenIds){
        const postData = {"children": childrenIds};
        const response = await _userService.deleteChildren(postData)
        return response;
    }

    async uploadUserImage(userImage){
        if(userImage){
            const filename = Utility.createUniqueFileName(userImage.name);
            const response = await _mediaService.getSignedUrl(filename, true);
            if (response.error) {
                return;
            }
            const uploadFile = await _mediaService.uploadMedia(response.body, userImage, userImage);
            //const filename = Utility.generateS3Url(signedUrl.body.url, userImage.name);
            return filename;
        }
    }

    async getOrganizations(){
        const response = await _organizationService.getOrganizations();
        _notifierService.showMessage(response);
        if(response && response.body){
            this.OrganizationList = response.body;
        }
    }

    async getStudyGroups(study){
        const response = await _groupService.getStudyGroups(study);
        _notifierService.showMessage(response);
        if(response && response.body){
            this.StudyGroups = response.body;
        }
    }

    async updateUserChildren(postContent){
        const data = {"children": postContent};
        const response = await _userService.updateChildren(data);
        return response;
    }

    async createUserChildren(postContent){
        const data = {"children": postContent};
        const response = await _userService.createChidren(data);
        return response;
    }

    async deleteUser(user) {
        const response = await _userService.deleteUser(user);
        return response;
    }

}

export default UserController;