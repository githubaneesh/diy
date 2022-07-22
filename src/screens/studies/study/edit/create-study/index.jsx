import React, { Component } from 'react';
import './style.scss';
import CreateStudyController from './createstudy';
import Loader from '../../../../widgets/loader';
import GroupsGrid from './components/groups-grid';
import Grid from '../../../../widgets/grid/index';
import DropdownMenu from '../../../../widgets/dropdown-menu';
import Calendar from '../../../../widgets/calendar/index';
import { FaDownload, FaSave, FaTrashAlt } from "react-icons/fa";
import Media from '../../../../widgets/media/index';
import Dropdown from '../../../../widgets/dropdown/index';
import Utility from '../../../../../utility/Utility';
import Upload from '../../../../widgets/upload/index';
import MediaService from '../../../../../services/mediaservice';
import DialogModal from '../../../../widgets/dialog-modal';
import CookieService from "../../../../../services/cookieservice";
import RoutesUtility from "../../../../../utility/routesutility";
import NotifierService from '../../../../../services/notifierService';
import { Messages } from '../../../../../utility/Messages';
import UserType from '../../../../../common/userType';
import defaultTranscribe from "../../../../../assets/default-transcribe-language.jpg"  
import TranscribeLanguage from '../../../../../common/constants';
import OrganizationService from '../../../../../services/organizationservice';
import Event from '../../../../../services/events/event';
import DropdownCreatable from '../../../../widgets/dropdown-creatable';
const _cookieService = CookieService.instance;
class CreateStudy extends Component {
    _organizationService = OrganizationService.instance;
    _notifierService = NotifierService.instance;
    user;
    _mediaService = MediaService.instance;
    _selectedFile;
    _controller;
    copyFromData = [{
        title: "Previous Study",
        submenu: []
    }];

    organizationsData = [];
    languagesData = [];
    defaultLanguage = null;
    selectedLanguage = null;

    currentStudy = {
        name:null, 
        objective:'',
        date:'',
        studyImage: null,
        taglistName: '',
        imageObjectKey: null,
        organization: {value: "", label: ""}
    };

    constructor(props){
        super(props);
        
        this.state = {
            fetching: true,
            editMode: false,
            studyId: props.studyId,
            refresh: false,
            isEdit: false,
            isTranscribeDisabled: false,
            disableCopy: true,
            showDeletePopup: false,
            showLanguagePopup: false
        }

        this.user = _cookieService.user;
        this._controller = new CreateStudyController();
        this.handleDefaultTranscribeClick = this.handleDefaultTranscribeClick.bind(this);
        this.renderLanguagePopup = this.renderLanguagePopup.bind(this);
        this.closeLanguagePopup = this.closeLanguagePopup.bind(this);
        this.displayLanguagePopup = this.displayLanguagePopup.bind(this);
        this.handleLanguageDropdown = this.handleLanguageDropdown.bind(this);
    }

    logout() {
        _cookieService.clearAll();
        CookieService.dispatchEvent(new Event(_cookieService.USER_LOGIN_STATUS, "user logged out."));
        this.props.history.push(RoutesUtility.LOGIN());
        this._notifierService.showMessage({error:true}, '', Messages.authentication_failed);
    }

    async componentDidMount(){
        if(this.user.userType.toLowerCase() !== UserType.ADMIN) {
            if(this.user.userType.toLowerCase() === UserType.MODERATOR || this.user.userType.toLowerCase() === UserType.CLIENT) {
                this.logout()
            }
            else if(this.user.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR && this.state.studyId) {
                const response = await this._controller.getStudyDetails(this.state.studyId);
                const isOutOfOrganization = await this.isStudyOutsideOfOrganization(response);
                if(isOutOfOrganization) {
                    this.logout();
                }
            }
        }
        
        this.fetchData();
    }


    async isStudyOutsideOfOrganization(studyDetails) {
        const _userType = this.user.userType.toLowerCase();
        const _orgId = studyDetails.client._id;
        const resp = await this._organizationService.getUserOrganization(this.user._id);
        //const organizationIds = resp?resp.body.map(org=> org._id) : [];
        return resp.body.organization !== _orgId;

    }

     fetchData = async()=>{

        const response = await this._controller.getOrganizations();
        await this._controller.getTranscribeLanguages();

        if(response && !response.error){

            this.organizationsData = Utility.convertToDisplayInDropDown(this._controller.Organizations);
            this.languagesData = Utility.convertToDisplayInDropDown(this._controller.transcribeLanguages);
            if(this.user && this.user.userType.trim().toLowerCase() === UserType.CLIENT_ADMINISTRATOR){
                this.currentStudy.organization = this.organizationsData[0]
            }
          
            //On edit fetch groups
            if (this.state.studyId) {
                await this._controller.fetchStudyGroups(this.state.studyId);
                // await this._controller.getStudyPartcipants(this.state.studyId);
                this.copyFromData[0].submenu = [];
                this.fillStudyDetails();
            } 
            else {
                
                await this._controller.getStudies();
                this.copyFromData[0].submenu = Utility.convertStudiesToDisplayInDropdownMenu(this._controller.StudyList);
                this.setState({fetching:  false, editMode: false, disableCopy: false})
            }   
        }
        else {
            this.setState({fetching:  false})
        }
    }

    async fillStudyDetails() {
        const response = await this._controller.getStudyDetails(this.state.studyId);
        if(response) {
            this.currentStudy.name = response.name;
            this.currentStudy.objective = response.description;
            this.currentStudy.date = response.beginsOn;
            this.currentStudy.studyImage = response.brandImageUrl;
            this.currentStudy.taglistName = response.taglistName;
            this.currentStudy.haveQuestionnaire = response.haveQuestionnaire;
            this.currentStudy.imageObjectKey = response.imageObjectKey
            this.defaultLanguage = this.getSelectedTranscribeLanguage(response.transcribeLanguage);
            this.selectedLanguage = this.defaultLanguage;
            if(this.user.userType.trim().toLowerCase() !== UserType.CLIENT && this.user.userType.trim().toLowerCase() !== UserType.CLIENT_ADMINISTRATOR){
                this.currentStudy.organization = this.getDefaultOrganization(response.client._id);
            }
            this.setState({
                fetching:  false, editMode: true, 
                disableCopy: true,
                isTranscribeDisabled: response.disableTranscribe?response.disableTranscribe:false
            });
        }

    }

    getDefaultOrganization(clientId) {
        return this.organizationsData.find((item)=> item.value === clientId);
    }

    getSelectedTranscribeLanguage(selectedLanguage = TranscribeLanguage.DEFAULT) {
        let defaultLanguage;
        for (var lang of this._controller.transcribeLanguages) {
            // selectedLanguage is id if already present in question else it is default language code
            if (selectedLanguage == lang._id || selectedLanguage == lang.code) {
                defaultLanguage = {
                    'value': lang._id,
                    'label': lang.name
                }
                break;
            }
        }
        return defaultLanguage;
    }


    handleSaveGroups = (type, groupData)=>{
        this.setState({fetching:  true}, async()=>{
            let response = {};
            if(type === "add"){
                response = await this._controller.createGroup(this.state.studyId, groupData);
              }
              else {
                response = await this._controller.updateGroup(groupData._id, groupData);
              }
              if(response && response.body){
                this.setState({refresh: !this.state.refresh, fetching: false})
              }
        })
        
    } 

    deleteGroupHandler = (groupId) =>{
        this.setState({fetching:  true}, async()=>{
            const response = await this._controller.deleteGroup(this.state.studyId, groupId);
            if(response){
                this.setState({refresh: !this.state.refresh, fetching: false})
            }
            return response;
        });
    }

    updateParticipantStatus = async(participantId, status)=>{
        const response = await this._controller.updateStudyParticipantStatus(participantId, status);
        return response;
    }

    dateChangeHandler=(e)=> {
        this.currentStudy.date = String(e);
        this.enableSaveStudy()
    }

    handleOrganizationChange = (selectedOrganization)=>{
        this.currentStudy.organization = selectedOrganization;
        this.enableSaveStudy()
    }

    uploadStudyImageHandler = async(file)=> {
        this._selectedFile = file;
        var reader = new FileReader();
    
        reader.onload = function(e) {
            this.currentStudy.studyImage = e.target.result;
            this.enableSaveStudy()
        }.bind(this);
        reader.readAsDataURL(this._selectedFile );
    }

    enableSaveStudy = ()=>{
        let enableSaveBtn = false;
        if(this.currentStudy.name !=='' && this.currentStudy.organization.value !=='' && this.currentStudy.date !== '' && this.currentStudy.date){
            enableSaveBtn = true;
        }
        this.setState({isEdit: enableSaveBtn});
    }

    uploadTaglistHandler = async(file)=> {

        if(this.state.editMode){
            const selectedFile = file;
            const user = _cookieService.user;
            const postContent = {
                file: selectedFile,
                createdBy: user._id // "5a3bb1dd28e7a21534899895" //created By is the logged in user id which will be added after authentication
            }
            let uploadType = this.currentStudy.haveQuestionnaire ? "update" : "create"; 
            const response = await this._controller.uploadTagList(uploadType, this.state.studyId, postContent);
            if(!response.error){
                this.currentStudy.haveQuestionnaire = true;
                this.currentStudy.taglistName = selectedFile.name;
                this.setState({refresh: !this.state.refresh});
                this.enableSaveStudy();
                const response = await this._controller.updateTaglistName(this.state.studyId, selectedFile.name);
            }
        }
    }
    handleDeleteStudyImage = ()=> {
        this.currentStudy.studyImage = "";
        this.currentStudy["imageObjectKey"] = "";
        this.currentStudy["brandImageUrl"] = "";
        this._selectedFile = undefined;
        this.setState({isEdit: true});
    }
    saveClickHandler=async()=> {
        
        if (this._selectedFile) {
            const filename = Utility.createUniqueFileName(this._selectedFile.name);
            const response = await this._mediaService.getSignedUrl(filename, true);
            if (response.error) {
                return;
            }
            const uploadFile = await this._mediaService.uploadMedia(response.body, this._selectedFile, this._selectedFile.type);
            this.currentStudy["brandImageUrl"] = "";
            this.currentStudy["imageObjectKey"] = filename;
        }

        if(!Utility.isValidText(this.currentStudy.name)){
            this._notifierService.showMessage({error:true}, '', Messages.require_study_name);
        }
        else if(!Utility.isValidText(this.currentStudy.organization.value)) {
            this._notifierService.showMessage({error:true}, '', Messages.require_origanization);
        }
        else if(!Utility.isValidText(this.currentStudy.date)) {
            this._notifierService.showMessage({error:true}, '', Messages.require_date);
        }
        else if(Utility.isValidText(this.currentStudy.date) && (Utility.getAge(this.currentStudy.date) < 0 || Utility.getAge(this.currentStudy.date) > 100)) {
            this._notifierService.showMessage({error:true}, '', Messages.invalid_date)
        }
        else {
            this.state.editMode ? this.updateStudy() : this.createStudy();
        }
    }

    updateStudy = async() =>{
        await this._controller.updateStudy(this.state.studyId, this.currentStudy);
        this.setState({isEdit: true});
    }

    createStudy = async()=>{
        const response = await this._controller.createStudy(this.currentStudy);
        if(response && response.body)
        {
            this.props.history.push(RoutesUtility.SETUP_STUDY(response.body._id));
            this.setState({studyId: response.body._id, editMode: true, disableCopy: true, isEdit:false}, ()=>{
                this.fetchData();
                this.copyFromData[0].submenu = [];
            });
        }
    }

    handleSubMenuSelection = async(selectedStudy)=>{
        const copyStudyResponse = await this._controller.copyStudy(selectedStudy.id);
        if(copyStudyResponse && copyStudyResponse.body){
            const newStudy = copyStudyResponse.body;
            const response = await this._controller.copyStudyContent(selectedStudy.id, newStudy.id);

            if(response && response.body){
                this.props.history.push(RoutesUtility.SETUP_STUDY(newStudy.id));
                this.setState({studyId: newStudy.id, editMode: true, disableCopy: true},()=>{
                    this.fetchData();
                    this.copyFromData[0].submenu = [];
                });
            }
        }

    }

    handleTagListDownload = async() =>{
        if (this.state.editMode) {
            const response = await this._controller.downloadTagList(this.state.studyId);
            if(response.error === null && response.data){
                window.open(response.tag_list_url);
            }
        }
    }

    handleTagListDelete = async() =>{
        this.setState({showDeletePopup: true});
    }

    deleteTag = async() =>{
        if (this.state.editMode && this.currentStudy.haveQuestionnaire) {
            const response = await this._controller.deleteTagList(this.state.studyId);
            if(!response.error){
                this.currentStudy.taglistName = '';
                this.currentStudy.haveQuestionnaire = false;
                this.closeDeletePopup();
                const response = await this._controller.updateTaglistName(this.state.studyId, '');
            }
        }
    }

    closeDeletePopup = ()=>{
        this.setState({showDeletePopup: false});
    }

    studyNameChangeHandler=(e)=> {
        this.currentStudy.name = e.target.value;
        this.enableSaveStudy()
    }

    studyObjectiveChangeHandler=(e)=> {
        this.currentStudy.objective = e.target.value;
        this.enableSaveStudy()
    }

    async handleDefaultTranscribeClick () {
        this.displayLanguagePopup();
    }

    displayLanguagePopup() {
        this.setState({showLanguagePopup: true})
    }

    closeLanguagePopup() {
        this.selectedLanguage = this.defaultLanguage;
        this.setState({showLanguagePopup: false})
    }

    handleLanguageDropdown(selectedLanguage) {
        this.selectedLanguage = selectedLanguage;
        this.setState({refresh: !this.state.refresh});
    }

    handleConfirmClick = async() =>{
        let previousLanguage = this.defaultLanguage;
        this.defaultLanguage = this.selectedLanguage;
        await this._controller.updateStudyTranscribeLanguage(this.state.studyId, this.defaultLanguage.value, previousLanguage.value);
        this.setState({showLanguagePopup: false})
    }

    onDisableVideoTranscribe = async(event) => {
        this.setState({
            isTranscribeDisabled: event.target.checked
        });
        await this._controller.disableTranscribe(this.state.studyId, event.target.checked);
    }

    handleClearOrganization = ()=>{
       // delete this.userObject["organization"];
    }

    handleCreateOrganization = async (organizationName) =>{
        const response = await this._controller.createOrganization(organizationName);
        if (response && response.data) {
            this.currentStudy.organization = {};
            this.currentStudy.organization["value"] = response.data._id;
            this.currentStudy.organization["label"] = response.data.name;
            this.setState({ refresh: !this.state.refresh })
        }
       
    }

    renderLanguagePopup() {
        return (
            <div>
                <DialogModal showModal={this.state.showLanguagePopup} refresh={true} modalCloseHandler={this.closeLanguagePopup} >
                    <div className="default-language-modal">
                        <div className="modal-header"><h3>Transcription Language</h3></div>
                        <div className="modal-body">
                            <Dropdown
                                optionsData={this.languagesData}
                                onChangeHandle={this.handleLanguageDropdown}
                                selected={this.selectedLanguage}
                                placeholder={""} />
                        </div>
                        <div className="modal-footer text-right">
                            <div className="button-group">
                                <button className="button" onClick={this.handleConfirmClick}> Confirm </button>
                            </div>
                        </div>
                    </div>
                </DialogModal>
            </div>
        )
    }

    render() {
        
        return (
            <div className="create-study">
                <div className="grid-container">
                    <div className="grid-item left-container">
                        <DropdownMenu list={this.copyFromData} submenu={true} disabled={this.state.disableCopy} onSubMenuSelection={this.handleSubMenuSelection}>
                        </DropdownMenu>
                        <div className="study-name-container">
                            <label>Study Name</label>
                            <input type="text" required={true} defaultValue={this.currentStudy.name} onChange={this.studyNameChangeHandler}></input>
                        </div>
                        <div className="organization-name-container">
                            <label>Organization</label>
                            {
                                (this.user.userType.toLowerCase() === UserType.ADMIN)
                                    ? <DropdownCreatable
                                        defaultOptionText="Select Organization"
                                        selected={this.currentStudy.organization}
                                        clearable={false}
                                        optionsData={this.organizationsData}
                                        createOption={this.handleCreateOrganization}
                                        onChangeHandle={this.handleOrganizationChange}
                                        clearSelectedOption={this.handleClearOrganization}
                                        placeholder={"Select Organization"} />
                                    : <Dropdown
                                        defaultOptionText="Select Organization"
                                        selected={this.currentStudy.organization}
                                        optionsData={this.organizationsData}
                                        onChangeHandle={this.handleOrganizationChange}
                                        placeholder={"Select Organization"} />
                            }
                                
                            
                            {/* <Dropdown
                             defaultOptionText="Select Organization" 
                             selected={this.currentStudy.organization}
                             optionsData={this.organizationsData} 
                             onChangeHandle={this.handleOrganizationChange}
                             placeholder={"Select Organization"} >
                            </Dropdown> */}
                        </div>
                        <div className="date-picker-container">
                            <Calendar onChange={this.dateChangeHandler} defaultDate={Utility.convertToDateString(this.currentStudy.date)}></Calendar>
                        </div>
                        <div className="study-objective">
                            <label>Study Objective</label>
                            <textarea defaultValue={this.currentStudy.objective} onChange={this.studyObjectiveChangeHandler}></textarea>
                        </div>
                        
                        <div className="grid-container buttons-container">
                            <div className="grid-item image-container">
                                {
                                    (Utility.isValidUrl(this.currentStudy.studyImage) || this.currentStudy.imageObjectKey)?
                                    <Media edit={true} imageObjectKey={this.currentStudy.imageObjectKey} url={this.currentStudy.studyImage} showStatus={false} handleDelete={this.handleDeleteStudyImage}></Media>
                                    : <Upload 
                                        onChangeHandler={this.uploadStudyImageHandler}
                                        type="image/png,image/jpeg"
                                        iconType="image"
                                        label="Upload Study Image">
                                    </Upload> 
                                } 
                            </div>
                            {
                               this.state.editMode && <div className="grid-item right-container">
                                    <Upload 
                                        onChangeHandler={this.uploadTaglistHandler}
                                        type=""
                                        label="Upload Tag List">
                                    </Upload> 
                                    <div className="taglist-container">
                                        <div>
                                            {
                                                Utility.isValidText(this.currentStudy.taglistName) && 
                                                <span onClick={()=>{this.handleTagListDownload()}} className="taglist-name">{this.currentStudy.taglistName}</span>
                                            }
                                            <button className="button" onClick={()=>{this.handleTagListDownload()}} disabled={!this.currentStudy.haveQuestionnaire}><FaDownload/></button>
                                            <button className="button delete" onClick={()=>{this.handleTagListDelete()}} disabled={!this.currentStudy.haveQuestionnaire}><FaTrashAlt/></button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                        {
                            this.state.editMode && <div className="language-container">
                                <div>
                                    <span className="language-link" onClick={this.handleDefaultTranscribeClick}>
                                        {`${this.defaultLanguage.label}`}
                                    </span>
                                    <button className="default-language-btn" onClick={this.handleDefaultTranscribeClick}>
                                        <img src={defaultTranscribe} />
                                    </button>
                                    <div className="disable-transcript-container">
                                        <input type="checkbox" id="disabled-transcribe" onChange={this.onDisableVideoTranscribe} checked={this.state.isTranscribeDisabled}/>
                                        <label className="" htmlFor="disabled-transcribe">Disable Video Transcriptions</label>
                                    </div>
                                </div>
                                
                                </div>
                        }
                        <div className="save-container">
                            {/* disabled={!this.state.isEdit|| !Utility.isValidText(this.currentStudy.name)} */}
                            <div className="save-btn-container">
                                <button className="button" 
                                onClick={this.saveClickHandler}><FaSave/> <span>Save Study</span></button>
                            </div>
                        </div>
                    </div>
                        <div className="grid-item table-lists">
                            {
                                (this.state.studyId && this.state.studyId !== "create-study")
                                && <div className="group-grid-container">
                                {
                                    this.state.fetching ? 
                                        <Loader />
                                        : <GroupsGrid groupsData={this._controller.StudyGroups} saveGroup={this.handleSaveGroups} deleteGroup = {this.deleteGroupHandler}/>
                                }
                                
                                </div>
                            }   
                        </div>  

                </div>
                <div >
                    <DialogModal showModal={this.state.showDeletePopup} modalCloseHandler={this.closeDeletePopup} >
                        <div className="delete-tag-modal">
                            <div className="modal-header"><h3>Delete Tag List</h3></div>
                            <div className="modal-body">
                                <p>Warning: This is permanent and can't be undone! <br /> 
                                    All tags on this list will be removed from the study and its posts permanently.</p>
                            </div>
                            <div className="modal-footer text-right">
                                <div className="button-group">
                                    <button className="button" onClick={this.closeDeletePopup}> Cancel </button>
                                    <button className="button remove" onClick={this.deleteTag}> Remove</button>
                                </div>
                            </div>
                        </div>
                    </DialogModal>
                </div>    
                {this.renderLanguagePopup()}
            </div>
        );
    }
}

export default CreateStudy;