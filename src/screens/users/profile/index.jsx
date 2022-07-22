import React, { Component } from 'react';
import "./style.scss";
import RoutesUtility from '../../../utility/routesutility';
import AutoSaveTextArea from '../../widgets/auto-save-textarea';
import AddToStudy from '../components/add-to-study';
import UserStudiesTable from './user-studies-table';
import UserController from '../users';
import Utility from '../../../utility/Utility';
import Loader from '../../widgets/loader';
import CookieService from '../../../services/cookieservice';
import ParticipantService from '../../../services/participantService';
import Media from '../../widgets/media/index';
import UserType from '../../../common/userType';
import { FaRegTrashAlt } from 'react-icons/fa';
import DialogModal from '../../widgets/dialog-modal';

class ViewProfile extends Component {
    _cookieService = CookieService.instance;
    _participantService = ParticipantService.instance;
    
    user;
    _controller;
    userId;
    userDetails = {};
    participant = {};

    constructor(props){
        super(props);
        this.state = {
            fetching: true,
            fetchingParticipations: false,
            showDeleteModal: false
        }
        this.user = this._cookieService.user;
        this.userId = this.props.match.params.user;
        this._controller = new UserController();
        this.removeParticipant = this.removeParticipant.bind(this);
    }

    editUser=()=> {
        const {history} = this.props;
        history.push(RoutesUtility.EDIT_USER(this.userId));
    }
    onBioSave=(e)=> {
        this._controller.updateUser(this.userId, {bio: e});
    }
    async componentDidMount() {
        this.setState({ fetching: true }, async () => {
            const resp = await this._controller.getUserDetails(this.userId);
            console.log(resp);
            if(resp && resp.body) {
                this.userDetails = Object.assign(this.userDetails, resp.body);
                this.userDetails["organization"] = {
                    value: this.userDetails.organization ? this.userDetails.organization._id : "",
                    name: this.userDetails.organization ? this.userDetails.organization.name : ""
                }
                // override if {profileImageUrl} not valid
                // checks if {profileImageUrl} is not valid and {profileImage} not blank
                if(!Utility.isImage(this.userDetails.profileImageUrl) && Utility.isValidText(this.userDetails.profileImage)) {
                    // asign blob url into image
                    this.userDetails.profileImageUrl = this.userDetails.profileImage;
                }
                this.setState({ fetching: false, fetchingParticipations: true });
    
                this.getParticipantsList();
            }
        });
    }
    getParticipantsList=async()=> {
        await this._controller.getUserParticipationList({user: this.userId});
        this.setState({ fetchingParticipations: false });
    }
    studyClickHandler=async(userData)=> {
        if(this.user && userData.study){
            const {history} = this.props;
            history.push(RoutesUtility.STUDY_VIEW(userData.study._id));
        }

        // history.push(RoutesUtility.BACK_TO_STUDY(userData.study._id, this.user.userType));
        // if(this.user && userData.study){
        //     const token = this.user.token;
        //     const encryptedString = CryptoHelper.encrypt({token, redirectTo: RoutesUtility.BACK_TO_STUDY(userData.study._id)}, process.env.REACT_APP_NONCE);
        //     window.location.href = `${process.env.REACT_APP_API_CMS}auth${token?'?t='+encryptedString : ''}`;
        // }
    }
    viewProfileHandler=(userData)=> {
        const {history} = this.props;
        history.push(RoutesUtility.PARTICIPANT_PROFILE(userData._id));
        // if(this.user && userData._id){
        //     const token = this.user.token;
        //     const encryptedString = CryptoHelper.encrypt({token, redirectTo: RoutesUtility.PARTICIPANT_PROFILE(userData._id)}, process.env.REACT_APP_NONCE);
        //     window.location.href = `${process.env.REACT_APP_API_CMS}auth${token?'?t='+encryptedString : ''}`;
        // }
    }
    getUserFullName(data) {
        return data.firstName+" "+data.lastName
    }
    editClickHandler=(userData)=> {
        this.participant = userData;
        this.setState({ fetchingParticipations: false });
    }
    removeClickHandler=async(participant)=> {
        await this._participantService.deleteParticipant(participant._id);
        this.getParticipantsList();
    }
    handleParticipantCreate=(resp)=> {
        this.participant = {};
        this.getParticipantsList();
    }
    handleCancelClick=()=> {
        this.participant = {};
    }
    handleDeleteParticipantClick = () =>{
        this.setState({showDeleteModal: true})
    }

    closeDeleteParticipantClick = () =>{
        this.setState({showDeleteModal: false})
    }

    async removeParticipant() {
        const response = await this._controller.deleteUser(this.userDetails._id);
        console.log("response: ", response);
        if (response && response.body) {
            const { history } = this.props;
            history.push(RoutesUtility.USERS_LIST_PROSPECT());
        }
    }

    renderDeleteParticipantDialog = () => {
        return(
            <DialogModal className="delete-participant-modal" showModal={this.state.showDeleteModal} modalCloseHandler={this.closeDeleteParticipantClick}>
                <div>
                    <div className="modal-header"><h3>Delete Participant</h3>
                    </div>
                    <div className="modal-body">
                        <p>
                            Deleting a participant is permanent and can not be undone. Are you sure you want to delete this participant?
                        </p>
                    </div>
                    <div className="modal-footer text-right">
                        <div className="button-group">
                            <button className="button cancel" onClick={this.closeDeleteParticipantClick}>Cancel</button> 
                            <button className="button remove" onClick={this.removeParticipant}>Remove</button>
                        </div>
                    </div>                    
                </div>
            </DialogModal>
        )
    }

    render() {
        return (
            <div className="profile">
                {
                    this.state.fetching ? <Loader />
                        : <div className="profile-inner">
                            <div className={(this.userDetails.profileImageUrl || this.userDetails.imageObjectKey) ? "profile-user-details column-with-image" : "profile-user-details column-without-image"}>
                                <div className="profile-image-container">
                                    {(this.userDetails.profileImageUrl || this.userDetails.imageObjectKey) 
                                    && <Media imageObjectKey={this.userDetails.imageObjectKey} url={this.userDetails.profileImageUrl} showStatus={false}></Media>}
                                </div>
                                <div>
                                    <div className="title">
                                        <div className="grid-item">
                                            <span className="name capitalize">{this.getUserFullName(this.userDetails)}</span>
                                            {
                                                (this.user.userType.toLowerCase() === UserType.ADMIN && this.userDetails.userType.toLowerCase() === UserType.PROSPECT)
                                                && <span className="delete-participant" onClick={this.handleDeleteParticipantClick}> 
                                                    <FaRegTrashAlt />
                                                </span>
                                            }
                                            
                                        </div>
                                        <div className="grid-item">
                                            <span className="prospect-label">{this.userDetails.userType}</span>
                                            <button className="button" onClick={this.editUser}>Edit</button>
                                        </div>
                                    </div>
                                    <div className="details">
                                        {
                                            (this.userDetails.userType.toLowerCase() === UserType.PROSPECT)
                                            && <div className="details-row">
                                                <div className="grid-item">
                                                    <div className="details-row-inner">
                                                        <div className="grid-item"><span>Gender:</span> <span className="capitalize">{this.userDetails.gender}</span></div>
                                                        <div className="grid-item"><span>Age:</span> <span>{Utility.getAge(this.userDetails.birthdate)}</span></div>
                                                    </div>
                                                </div>
                                                <div className="grid-item"><span>Location:</span> <span className="capitalize">{this.userDetails.city + ", " + this.userDetails.state + ", " + this.userDetails.country}</span></div>
                                                <div className="grid-item"><span>Occupation:</span> <span className="capitalize">{this.userDetails.occupation}</span></div>
                                            </div>
                                        }
                                        {
                                            (this.userDetails.userType.toLowerCase() === UserType.CLIENT || this.userDetails.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR)
                                            && <div className="details-row">
                                                <div className="grid-item"> <span>Organization: </span> {this.userDetails.organization.name}
                                                </div>
                                            </div>
                                        }
                                        
                                        <div className="details-row">
                                            <div className="grid-item"><span>Email:</span> {this.userDetails.email}</div>
                                            <div className="grid-item"><span>Phone:</span> {this.userDetails.phone}</div>
                                            <div className="grid-item"></div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            {
                                (this.userDetails.userType.toLowerCase() === UserType.MODERATOR || this.userDetails.userType.toLowerCase() === UserType.PROSPECT) 
                                && <div>
                                    <div className="user-bio">
                                        <AutoSaveTextArea
                                            rows={4}
                                            title={"Bio"}
                                            editorStyle={{ width: '100%' }}
                                            textValue={this.userDetails.bio}
                                            saveData={this.onBioSave}>
                                        </AutoSaveTextArea>
                                    </div>
                                    <div className="divider-space hr">
                                        <span>Studies</span>
                                    </div>
                                    <div>
                                        <AddToStudy
                                            user={this.userDetails}
                                            participant={this.participant}
                                            onCancelClick={this.handleCancelClick}
                                            onParticipantCreate={this.handleParticipantCreate}>
                                        </AddToStudy>
                                    </div>
                                    <div className="participant-container">
                                        {
                                            this.state.fetchingParticipations ? <Loader />
                                                : <UserStudiesTable data={this._controller.ParticipantList}
                                                    userType={this.userDetails.userType}
                                                    studyClickHandler={this.studyClickHandler}
                                                    viewProfileHandler={this.viewProfileHandler}
                                                    removeClickHandler={this.removeClickHandler}
                                                    editClickHandler={this.editClickHandler}>
                                                </UserStudiesTable>
                                        }
                                    </div>
                                </div>
                            }
                          
                        </div>
                }
                {this.renderDeleteParticipantDialog()}
            </div>
        );
    }
}

export default ViewProfile;