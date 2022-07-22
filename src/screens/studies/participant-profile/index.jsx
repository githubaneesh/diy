import React, { Component } from 'react';
import './style.scss';
import StudyCard from '../studycard/index';
import { FaRegTrashAlt } from 'react-icons/fa';
import Loader from '../../widgets/loader';
import ParticipantsPost from '../components/participants-post/index';
import AutoSaveTextArea from '../../widgets/auto-save-textarea/index';
import Utility from '../../../utility/Utility';
import DialogModal from '../../widgets/dialog-modal';
import ParticipantController from './participantProfile';
import RoutesUtility from '../../../utility/routesutility';
import GoogleTranslateService from "../../../services/googletranslate";
import CookieService from '../../../services/cookieservice';
import UserType from '../../../common/userType';
import moment from 'moment';
import StudyService from '../../../services/studyService';
import NotifierService from '../../../services/notifierService';
import { Messages } from '../../../utility/Messages';
import Event from '../../../services/events/event';

const _cookieService = CookieService.instance;
class ParticipantProfile extends Component {
    _cookieService = CookieService.instance;
    _studyService = StudyService.instance;
    _notifierService = NotifierService.instance;
    participantDetails = {};
    user;
    constructor(props) {
        super(props);

        this.state = {
            fetching: true,
            refresh: false,
            showDeleteModal: false
        }

        this.user = _cookieService.user;

        this._controller = new ParticipantController(this);
        this.handleNotesSave = this.handleNotesSave.bind(this);
        this.onBioSave = this.onBioSave.bind(this);
        this.renderParticipantDetails = this.renderParticipantDetails.bind(this);
        this.renderDeleteParticipantDialog = this.renderDeleteParticipantDialog.bind(this);
        this.removeParticipant = this.removeParticipant.bind(this);
        this.handleFetchMorePosts = this.handleFetchMorePosts.bind(this);
        this.handleDeletePost = this.handleDeletePost.bind(this);
        this._googleTranslate = GoogleTranslateService.instance;
    }

    async isStudyAssingedToMe(studyId) {
        const _userType = this.user.userType.toLowerCase();
        // const resp = await this._study.fetchAssignedStudies("unarchived");
        const resp = await this._studyService.fetchStudies({type: "unarchived"});
        const studyIds = resp?resp.body.map(study=> study._id) : [];
        return studyIds.includes(studyId);

    }

    logout() {
        this._cookieService.clearAll();
        CookieService.dispatchEvent(new Event(this._cookieService.USER_LOGIN_STATUS, "user logged out."));
        this.props.history.push(RoutesUtility.LOGIN());
        this._notifierService.showMessage({error:true}, '', Messages.authentication_failed);
    }

    componentDidMount() {
        this.setState({ fetching: true }, async () => {
            this.user = _cookieService.user;
            const resp = await this._controller.getParticipantDetails(this.props.match.params.participant);
            if(this.user.userType.toLowerCase() !== UserType.ADMIN) {
                const isStudyAssinged = await this.isStudyAssingedToMe(resp.data.study._id);
                if(!isStudyAssinged) {
                    this.logout();
                }
            }
            await this._controller.fetchPost(this.props.match.params.participant);
            if(resp && resp.data) {
                this.participantDetails = Object.assign(this.participantDetails, resp.data);
                this.setState({ fetching: false });
            }
        });
    }

    fetchPosts = async() => {
        await this._controller.fetchPost(this.props.match.params.participant);
        this.setState({refresh: !this.state.refresh});
    }

    async handleFetchMorePosts() {
        await this._controller.fetchMorePosts(this.props.match.params.participant);
    }

    onTranslateClicked = async () => {
        const translatedTitle = await this._googleTranslate.translateToDefault(this.participantDetails.study.name);
        if (!translatedTitle.error) {
            this.participantDetails.study["translatedName"] = translatedTitle.body[0].translatedText;
        }
        const translatedObjective = await this._googleTranslate.translateToDefault(this.participantDetails.study.description);
        if (!translatedObjective.error) {
            this.participantDetails.study["translatedDescription"] = translatedObjective.body[0].translatedText;
        }
        if(!translatedObjective.error && !translatedTitle.error) {
            this.setState({refresh: !this.state.refresh});
        }
    }
    onStudyClicked=()=> {
        this.props.history.push(RoutesUtility.STUDY_VIEW(this.participantDetails.study._id));
    }
    async onBioSave(updatedBio) {
        const { participant } = this.props.match.params;
        const oldBio = this.participantDetails.description;
        if (participant && updatedBio !== oldBio) {
            const data = { "description": updatedBio };
            const response = await this._controller.updateParticipant(data, participant);
            if (response && response.data) {
                this.participantDetails = response.data;
                this.setState({ refresh: !this.state.refresh });
            }
        }

    }

    async handleNotesSave(updatedNotes) {
        const { participant } = this.props.match.params;
        const oldNotes = this.participantDetails.notes;
        if (participant && updatedNotes !== oldNotes) {
            const data = { "notes": updatedNotes };
            const response = await this._controller.updateParticipant(data, participant);
            if (response && response.data) {
                this.participantDetails = response.data;
                this.setState({ refresh: !this.state.refresh });
            }
        }
    }

    renderParticipantDetails() {
        const isAdmin = this.user.userType.trim().toLowerCase() === UserType.ADMIN;
        return (
            <div className="participant-bio">
                <div className="participant-title">
                    <div className="title-row">
                        <span className="participant-name capitalize">
                            <h3>{this.participantDetails.user.firstName} {isAdmin ? this.participantDetails.user.lastName : this.participantDetails.user.lastName.charAt(0).toUpperCase()}</h3>
                        </span>
                        {
                            isAdmin && <span className="delete-participant" onClick={this.handleDeleteParticipantClick}> <FaRegTrashAlt /> </span>
                        }
                        
                    </div>
                    <div className="title-row title-group">
                        <span className="participant-group"> <strong>{(this.participantDetails.group) && this.participantDetails.group.name}</strong></span>
                    </div>
                </div>
                <div className="participant-user-details">
                    <ul className="list-inline">
                        <li>
                            <span>Gender: </span>
                            <span className="capitalize">{this.participantDetails.user.gender}</span>
                        </li>
                        <li>
                            <span>Age: </span>
                            <span>{this.participantDetails.user.birthdate ? Utility.getAge(this.participantDetails.user.birthdate) : "N/A"}</span>
                        </li>
                        <li>
                            <span>Location: </span>
                            <span className="capitalize">{this._controller.getLocation(this.participantDetails.user.city, this.participantDetails.user.state, this.participantDetails.user.country)}</span>
                        </li>
                        <li>
                            <span>Occupation: </span>
                            <span className="capitalize">{this.participantDetails.user.occupation ? this.participantDetails.user.occupation : "N/A"}</span>
                        </li>
                    </ul>
                </div>
                <div className="participant-user-email">
                    <ul className="list-inline">
                        {isAdmin && <li>{this.participantDetails.user.email}</li>}
                        <li>{this.participantDetails.user.phone}</li>
                    </ul>
                </div>

                <div>
                    <div className="user-bio">
                        <AutoSaveTextArea
                            rows={4}
                            title={"Bio"}
                            editorStyle={{ width: '100%' }}
                            textValue={this.participantDetails.description}
                            saveData={this.onBioSave}>
                        </AutoSaveTextArea>
                    </div>
                    <div className="user-notes">
                        <AutoSaveTextArea
                            rows={4}
                            title={"Notes"}
                            editorStyle={{ width: '100%' }}
                            textValue={this.participantDetails.notes}
                            saveData={this.handleNotesSave}>
                        </AutoSaveTextArea>
                    </div>
                </div>
            </div>
        );
    }

    handleDeleteParticipantClick = () =>{
        this.setState({showDeleteModal: true})
    }

    closeDeleteParticipantClick = () =>{
        this.setState({showDeleteModal: false})
    }

    async removeParticipant() {
        const { participant } = this.props.match.params;
        const response = await this._controller.deleteParticipant(participant);
        if(response && response.data) {
            const { history } = this.props;
            const { study } = response.data
            history.push(RoutesUtility.STUDY_VIEW(study));
        }
    }

    renderDeleteParticipantDialog() {
        
        return(
            <DialogModal className="delete-participant-modal" showModal={this.state.showDeleteModal} modalCloseHandler={this.closeDeleteParticipantClick}>
                <div>
                    <div className="modal-header"><h3>Delete Participant</h3>
                    </div>
                    <div className="modal-body">
                        <p>
                            {`Remove ${(this.participantDetails.user) && this.participantDetails.user.firstName} ${(this.participantDetails.user) && this.participantDetails.user.lastName} from study ${(this.participantDetails.study) && this.participantDetails.study.name} ?`}
                        </p>
                        <p>
                            This is permanent and can't be undone! All posts and comments created for this study by this participant will be permanently lost.
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

    markPostAsResolved  = async(e, postId) => {
        const postData = {"isPostResolved": e.target.checked};
        
        const response = await this._controller.markPostAsResolved(postData, postId);
        if(response && response.data) {
            this._controller.posts.forEach(post => {
                if(post._id === postId) {
                    post.isPostResolved = response.data.isPostResolved;
                    response.data = Object.assign({}, post);
                }
            });
            this.setState({ refresh: !this.state.refresh });
            return response.data;
        }
    }

    async handleDeletePost(postToDelete) {
        const participantId = this.props.match.params.participant;
        await this._controller.deletePost(postToDelete._id, participantId);
        await this._controller.fetchPost(this.props.match.params.participant);
        this.setState({ refresh: !this.state.refresh });
    }

    updatePostMedia = (selectedPost, updatedMedia) => {
        this._controller.posts.forEach(p => {
            if (p._id === selectedPost._id) {
                p.media.forEach(m => {
                    if (m._id === updatedMedia._id) {
                        m.description = updatedMedia.description;
                    }
                })
            }
        });
        
        this.setState({ refresh: !this.state.refresh });
    }

    updateLastPost = (postId) =>{
        let isUpdated = false;
        this._controller.posts.forEach(post => {
            if(post._id === postId && post.hasOwnProperty("isResolved") && !post.isResolved) {
                post.isResolved = true;
                isUpdated = true;
            }
        });
        if(isUpdated) {
            this.setState({ refresh: !this.state.refresh });
        }
    }

    render() {

        const params = new URLSearchParams(this.props.location.search);
        const postId = params.get("p");
        
        return (
            <div>
                <div className="breadcumbs">Participant</div>
                {
                this.state.fetching?
                <Loader/>
                :(Object.keys(this.participantDetails).length > 0) 
                && (<div className="participant-profile">
                        <StudyCard
                            name={this.participantDetails.study.name}
                            study={{}}
                            isArchive={false}
                            participantCount={this.participantDetails.study.participants || 0}
                            client={this.participantDetails.study.client.name}
                            date={moment(this.participantDetails.study.beginsOn).format("MMMM Do YYYY")}
                            brandImage={this.participantDetails.study.brandImageUrl}
                            imageObjectKey={this.participantDetails.study.imageObjectKey}
                            description={this.participantDetails.study.description}
                            archiveUnarchiveText={""}
                            onStudyClicked={() => this.onStudyClicked(this.participantDetails.study._id)}
                            translatedName={this.participantDetails.study.translatedName}
                            translateddescription={this.participantDetails.study.translatedDescription}
                            onTranslateClicked={() => this.onTranslateClicked()}
                            onEditClicked={() => {}}
                            onArchiveUnarchiveStudy={(e) => {}} />
                        {
                            (this.user && this.user._id && this.user.userType 
                                && (this.user.userType.trim().toLowerCase() === UserType.ADMIN 
                                    || this.user.userType.trim().toLowerCase() === UserType.MODERATOR
                                    || this.user.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR) && this.renderParticipantDetails())
                        }
                        <ParticipantsPost
                            history={this.props.history}
                            studyId={this.participantDetails.study._id}
                            participantId={this.props.match.params.participant}
                            selectedPostId={postId} 
                            participantData={this.participantDetails} 
                            postCount={this._controller.postCount} 
                            posts={this._controller.posts} 
                            removePost={this.handleDeletePost}
                            markPostAsResolved={this.markPostAsResolved}
                            refetchPosts = {this.fetchPosts}
                            updatePostMedia = {this.updatePostMedia}
                            fetchMorePosts={this.handleFetchMorePosts}
                            updateLastPost={this.updateLastPost}/>
                    </div>)
                }
                {this.renderDeleteParticipantDialog()}
            </div>
        );
    }
}

export default ParticipantProfile;