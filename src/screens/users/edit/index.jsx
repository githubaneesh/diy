import React, { Component } from 'react';
import "./style.scss";
import PrimaryDetails from '../components/primary-details';
import ProspectDetails from '../components/prospect-details';
import Dropdown from '../../widgets/dropdown/index';
import { FaSave } from 'react-icons/fa';
import UserController from '../users';
import Utility from '../../../utility/Utility';
import {Messages} from '../../../utility/Messages'
import RoutesUtility from '../../../utility/routesutility';
import NotifierService from '../../../services/notifierService';
import DropdownCreatable from '../../widgets/dropdown-creatable';
import UserType from '../../../common/userType';

const _notifierService = NotifierService.instance;
class EditUser extends Component {

    _controller;
    editUserData;
  
    constructor(props) {
        super(props);
        this.state = {
            userType: undefined,
            showPhoneInput: false,
            refresh: false,
            errorMessage:''
        }
        this.userId = props.match.params.user;
        this.selectedRole = undefined;
        this.userObject = {};
        this.propspectFields = {};
        this.prospectChild = [];
        this.defaultOrganization = undefined;
        this._controller = new UserController();
        this.handleSave = this.handleSave.bind(this);
        this.fetchFormData = this.fetchFormData.bind(this);
    }
    async componentDidMount() {
        if (this.userId) {
            const resp = await this._controller.getUserDetails(this.userId);
            if (resp && resp.body) {
                const accountType = resp.body.userType.trim();
                if (accountType.toLowerCase() === UserType.PROSPECT) {
                    this.propspectFields = Object.assign(this.propspectFields, resp.body);
                    // console.log("propspectFields : ", this.propspectFields);
                    this.prospectChild = this.propspectFields.children;
                }
                else {
                    this.userObject = Object.assign(this.userObject, resp.body);
                    this.userObject["study"] = resp.body.studies;
                }
                this.editUserData = Object.assign({}, resp.body);
                const showPhone = accountType.toLowerCase() === UserType.CLIENT || UserType.MODERATOR;
                this.setState({ userType: accountType, showPhoneInput: showPhone});
                await this.fetchFormData(accountType);
            }
        }
        else {
            await this._controller.getUserRoles();
        }
        this.setState({ refresh: !this.state.refresh })
       
    }
    handleCancel=()=> {
        const {history} = this.props;
        history.goBack();
    }
    showUserForm= async(role)=> {
        const userType = role.name;
        this.selectedRole = role;
        if (userType !== this.state.userType) {
            this.userObject = {};
            this.propspectFields = {};
            this.prospectChild = [];
            switch (userType.toLowerCase()) {
                case UserType.ADMIN:
                    this.setState({ userType: userType, showPhoneInput: false, errorMessage: ''});
                    break;
                case UserType.PROSPECT:
                    this.setState({ userType: userType, showPhoneInput: false, errorMessage: ''}, async()=>{
                        await this.fetchFormData(userType);
                        this.setState({refresh: !this.state.refresh});
                    });
                    break;
                case UserType.CLIENT:
                case UserType.CLIENT_ADMINISTRATOR:
                    await this.fetchFormData(userType);
                    this.setState({ userType: userType, showPhoneInput: true, errorMessage: ''});
                    break;
                case UserType.MODERATOR:
                    await this.fetchFormData(userType);
                    this.setState({ userType: userType, showPhoneInput: true, errorMessage: ''});
                    break;
                case UserType.RECRUITER:
                    this.setState({ userType: userType, showPhoneInput: false, errorMessage: ''});
                    break;
                default:
                    break;
            }
        }
    }

    async fetchFormData(accountType){
        if(accountType.toLowerCase() === UserType.CLIENT || accountType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR){
            await this._controller.getOrganizations();
            if (this.userId && this.userObject.organization) {
                this.defaultOrganization = {};
                this.defaultOrganization["value"] = this.userObject.organization._id;
                this.defaultOrganization["label"] = this.userObject.organization.name;
            }
        }
        else if (accountType.toLowerCase() === UserType.MODERATOR) {
            await this._controller.getStudies();
        }
        else if(accountType.toLowerCase() === UserType.PROSPECT){
            await this._controller.getStudies();
            await this._controller.getOrganizations();
            await this._controller.getOccupations();
        }
    }

    handleCreateOccupation = async (occupationName) => {
        console.log("occupationName : ", occupationName);
        await this._controller.createOccupation(occupationName);
        this.propspectFields["occupation"] = occupationName;
        this.setState({ refresh: !this.state.refresh })
    }

    handleCreateOrganization = async (organizationName) =>{
        const response = await this._controller.createOrganization(organizationName);
        if (response && response.data) {
          
            this.userObject["organization"] = response.data._id;
            this.defaultOrganization = {};
            this.defaultOrganization["value"] = response.data._id;
            this.defaultOrganization["label"] = response.data.name;
            this.setState({ refresh: !this.state.refresh })
        }
       
    }

    async handleSave() {
        let errorMsg = '';
        errorMsg = this.state.userType.toLowerCase() === UserType.PROSPECT ? this.validateProspectUserFields() : this.validateUserFields();

        if (errorMsg) {
            _notifierService.showMessage({ error: true }, "", errorMsg);
        }
        else {
            const userId = this.props.match.params.user;
            let userData = this.state.userType.toLowerCase() === UserType.PROSPECT ? this.propspectFields : this.userObject;
            await this.saveProspectChildData(userData, userId);

            if (userId) {
                await this.saveEditUserData(userData, userId);
            }
            else {
                await this.saveCreateUser(userData);
            }
        }
    }

    saveEditUserData = async(userData, userId)=>{
        let modifiedData = {};
        Object.keys(userData).map((key)=>{
            if (userData[key] !== this.editUserData[key]) {
                modifiedData[key] = userData[key];
            }
        });
        delete modifiedData["study"];
        const response = await this._controller.updateUser(userId, modifiedData);
        if (response && response.body) {
            const { history } = this.props;
            history.push(RoutesUtility.VIEW_PROFILE(response.body._id));
        }
    }

    saveCreateUser = async(userData)=>{
        userData["role"] = this.selectedRole._id;
        userData["userType"] = this.selectedRole.name;
        const response = await this._controller.createUser(userData);
        console.log("response : ", response);
        if (response && response.body) {
            const { history } = this.props;
            history.push(RoutesUtility.VIEW_PROFILE(response.body._id));
        }
    }

    saveProspectChildData = async(userData, userId)=>{
        if (this.state.userType && this.state.userType.toLowerCase() === UserType.PROSPECT) {
            userData["child"] = this.prospectChild
            if (userData.userImage) {
                const filename = await this._controller.uploadUserImage(userData.userImage);
                if (filename) {
                    // userData["profileImageUrl"] = userImageUrl;
                    userData["imageObjectKey"] = filename;
                }
            }
            if (userId && userData.child) {
                // for each child, update if already created else create child
                for (var child of userData.child) {
                    if (child._id) {
                        let updateChild = child;
                        if (!Array.isArray(updateChild)) {
                            let childArray = [];
                            childArray.push(updateChild)
                            updateChild = childArray;
                        }
                        updateChild = JSON.stringify(updateChild);
                        await this._controller.updateUserChildren(updateChild);
                    } else {
                        const addedChild = JSON.stringify([child]);
                        await this._controller.createUserChildren(addedChild);
                    }
                }

                delete userData["child"];
                delete userData["children"];
            }
        }
    }

    validateUserFields = ()=>{
        let errorMsg = "";
        if ((this.state.userType.toLowerCase() === UserType.CLIENT || this.state.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR)
            && !this.userObject.organization) {
            errorMsg = Messages.require_organization
            return errorMsg;
        }
       
        if(!this.userObject.firstName){
            errorMsg = Messages.require_firstname
            return errorMsg;
        }
        if(!this.userObject.lastName){
            errorMsg = Messages.require_lastname
            return errorMsg;
        }
        if(!this.userObject.email){
            errorMsg = Messages.require_email
            return errorMsg;
        }
        if(this.userObject.email && !Utility.isValidEmail(this.userObject.email)){
            errorMsg = Messages.invalid_email
            return errorMsg;
        }
        if(!this.userObject.password){
            errorMsg = Messages.require_password
            return errorMsg;
        }
        if(this.state.userType.toLowerCase() === UserType.MODERATOR && !this.userObject["study"]){
            errorMsg = Messages.require_study
            return errorMsg;
        }
        
        return errorMsg;
    }

    validateProspectUserFields = ()=>{
        let errorMsg = "";
        if(!this.propspectFields.firstName){
            errorMsg = Messages.require_firstname
            return errorMsg;
        }
        if(!this.propspectFields.lastName){
            errorMsg = Messages.require_lastname
            return errorMsg;
        }
        if(this.propspectFields.birthdate) {
            const age = Utility.getAge(this.propspectFields.birthdate);
            if(age < 0 || age > 100 || !Utility.isValidText(this.propspectFields.birthdate)) {
                errorMsg = Messages.invalid_date
                return errorMsg;
            }
        }
        if(!this.propspectFields.email){
            errorMsg = Messages.require_email
            return errorMsg;
        }
        if(this.propspectFields.email && !Utility.isValidEmail(this.propspectFields.email)){
            errorMsg = Messages.invalid_email
            return errorMsg;
        }        
        if(!this.propspectFields.password){
            errorMsg = Messages.require_password
            return errorMsg;
        }
        if(!this.propspectFields.city){
            errorMsg = Messages.require_location
            return errorMsg;
        }
        if(!this.propspectFields.country){
            errorMsg = Messages.require_location
            return errorMsg;
        }
        if (this.prospectChild && this.prospectChild.length > 0) {
            const child = this.prospectChild.filter(p=> !p.name || !p.gender || !p.birthdate)
            if(child.length > 0){
                errorMsg =  Messages.require_child;
                return errorMsg;
            }
          
        }
        return errorMsg;
    }

    organizationSelectHandle = (selectedOrganization) => {
        this.userObject["organization"] = selectedOrganization.value;
    }

    handleClearOrganization = ()=>{
        delete this.userObject["organization"];
    }

    handleStudySelection = async(selectedStudy)=>{
        if(this.state.userType.toLowerCase() === UserType.MODERATOR){
            this.userObject["study"] = selectedStudy.value;
        }
        else {
            this.propspectFields["study"] = selectedStudy.value;
            await this._controller.getStudyGroups(selectedStudy.value);
        }
        
        this.setState({refresh: !this.state.refresh});
    }
    handleClearStudy = ()=>{
        if(this.state.userType.toLowerCase() === UserType.MODERATOR){
            delete this.userObject["study"];
        }
        else {
            delete this.propspectFields["study"];
        }
      
        this.setState({refresh: !this.state.refresh});
    }
  
    fieldChange = (fieldsData)=>{
        this.userObject = Object.assign(this.userObject, fieldsData);
    }

    prospectFieldsChange = (fieldsData)=>{
        this.propspectFields = Object.assign({}, fieldsData);
    }

    prospectChildChange = (fieldsData) =>{
        this.prospectChild = Object.assign([], fieldsData);
    }

    handlePropsectChildDelete = async (childId, childIndex) => {
        const data = JSON.stringify([{ "_id": childId }]);
        const response = await this._controller.deleteChildren(data);
        this.prospectChild.splice(childIndex, 1);
        this.setState({ refresh: !this.state.refresh })
    }

    getUserName = ()=>{
        let userName;
        if(this.props.match.params.user && this.state.userType){
            userName = this.state.userType.toLowerCase() === UserType.PROSPECT ? `${this.propspectFields.firstName} ${this.propspectFields.lastName}` : `${this.userObject.firstName} ${this.userObject.lastName}`;
        }
        return userName;
    }

    render() {
        const userName = this.getUserName();
        return (
            <div className={this.props.match.params.user?"edit-user":"create-user"}>       
                <div className="breadcumbs capitalize"> { userName  ?  `${userName}  > Edit` 
                :<ul>
                    <li>Users</li>
                    <li>New</li>
                    <li>Edit</li>
                 </ul>
                 }</div>

                <div className="actions">
                    <div className="title-container">
                        <div className="grid-item"></div>
                        <div className="grid-item"><span className="title"> {(userName && this.state.userType) ? `Edit ${this.state.userType}` : 'Add a new account'}</span></div>
                        <div className="grid-item">
                            <button className="cancel" onClick={this.handleCancel}>Cancel</button>
                        </div>
                    </div>
                    <div className="action-inner">
                        <span>Select an account role:</span>
                        <div className="action-button">
                            {
                                this._controller.UserRoles.map(role=>{
                                    return(
                                        <button key={role._id} className={this.state.userType === role.name ? "selected" : ""}
                                            onClick={() => this.showUserForm(role)}> {role.name} </button>
                                    )
                                })
                            }
                        </div> 
                    </div>
                </div>
                <div className="user-fields">
                    {
                       (this.state.userType && (this.state.userType.toLowerCase() === UserType.CLIENT || this.state.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR)) && (
                            <div className="organization-list">
                                <div className="label">Organization</div>
                                {
                                    <DropdownCreatable 
                                        defaultOptionText=""
                                        selected={this.defaultOrganization}
                                        clearable={true}
                                        optionsData={Utility.convertToDisplayInDropDown(this._controller.OrganizationList)}
                                        createOption={this.handleCreateOrganization}
                                        onChangeHandle={this.organizationSelectHandle}
                                        clearSelectedOption={this.handleClearOrganization}
                                        placeholder={""} />
                                }
                            </div>
                        )
                    }
                    {
                        (this.state.userType && this.state.userType.toLowerCase() === UserType.PROSPECT) 
                        ? <ProspectDetails
                                key={`user-${this.state.userType}`}
                                groups={Utility.convertToDisplayInDropDown(this._controller.StudyGroups)}
                                occupations={Utility.convertStringArrayToDisplayInDropDown(this._controller.OccupationList)}
                                data={this.propspectFields}
                                child={this.prospectChild}
                                parentKey={this.props.match.params.user}
                                deleteChild={this.handlePropsectChildDelete}
                                childValueChange={this.prospectChildChange}
                                userType={this.state.userType}
                                createOccupation={this.handleCreateOccupation}
                                prospectFieldsChange={this.prospectFieldsChange} />
                            : this.state.userType && <PrimaryDetails
                                key={this.state.userType}
                                parentKey={this.props.match.params.user}
                                data={this.userObject}
                                phone={this.state.showPhoneInput}
                                fieldValueChange={this.fieldChange}
                                userType={this.state.userType} />
                    }
                   
                    {
                        (!userName && this.state.userType && (this.state.userType.toLowerCase() === UserType.PROSPECT || this.state.userType.toLowerCase() === UserType.MODERATOR))
                        && <div className="study-options">
                            <div className="label">
                                Which study would you like to assign? 
                                { 
                                    this.state.userType.toLowerCase() === UserType.PROSPECT ? <span> (Optional)</span> : <span> (Mandatory)</span>
                                }
                            </div>
                            <Dropdown defaultOptionText=""
                                optionsData={Utility.convertToDisplayInDropDown(this._controller.StudyList)}
                                onChangeHandle={this.handleStudySelection}
                                clearable={true}
                                clearSelectedOption={this.handleClearStudy}
                                placeholder={""} />
                        </div>
                    }
                    {
                      
                        this.state.userType && (<div className="btn-container">
                            <button className="button" onClick={this.handleSave}>
                                <FaSave /> <span>Save</span>
                            </button>
                        </div>)
                        
                    }
                    
                    
                </div>
            </div>
        );
    }
}

export default EditUser;