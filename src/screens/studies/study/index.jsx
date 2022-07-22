import React, { Component } from 'react';
import { Link } from "react-router-dom";
import StudyPartcipants from '../components/studyparticipants';
import StudyController from './study';
import GroupsList from '../components/groups-list';
import TagList from '../components/tag-list';
// import StudiesController from "../studies";
import "./style.scss";
import StudyCard from '../studycard/index';
import StudyType from '../../../common/studyType';
import Loader from '../../widgets/loader';
import CookieService from '../../../services/cookieservice';
import GoogleTranslateService from "../../../services/googletranslate";
import UserType from '../../../common/userType';
import moment from "moment";
import RoutesUtility from '../../../utility/routesutility';
import OrganizationService from '../../../services/organizationservice';
import { Messages } from '../../../utility/Messages';
import NotifierService from '../../../services/notifierService';
import Event from '../../../services/events/event';

class Study extends Component {
    
    _study;
    study;
    _cookieService = CookieService.instance;
    _googleTranslate = GoogleTranslateService.instance;
    _organizationService = OrganizationService.instance;
    _notifierService = NotifierService.instance;

    constructor(props){
        super(props);
        this.state = {
            refresh: false,
            fetching: true
        }
        this.user = this._cookieService.user;
        this.filteredParticipants = null;
        this._study  = new StudyController(this);
        this.sortParticipants = this.sortParticipants.bind(this);
        this.onArchiveUnarchiveStudy = this.onArchiveUnarchiveStudy.bind(this);
    }

    refreshUI = () => {
        this.setState({
            refresh: !this.state.refresh
        })
    }

    async isStudyAssingedToMe(studyId) {
        const _userType = this.user.userType.toLowerCase();
        if(_userType === UserType.MODERATOR) {
            const resp = await this._study.fetchAssignedStudies("unarchived");
            const studyIds = resp?resp.map(study=> study._id) : [];
            return studyIds.includes(studyId);
        }
        return true;
    }

    async isStudyOutsideOfOrganization(studyDetails) {
        const _userType = this.user.userType.toLowerCase();
        const _orgId = studyDetails.client._id;
        if(_userType === UserType.CLIENT || _userType === UserType.CLIENT_ADMINISTRATOR) {
            const resp = await this._organizationService.getUserOrganization(this.user._id);
            return resp.body.organization !== _orgId;
        }
        return false;
    }

    studyGroupItemClick=(groupSelected)=> {

        if(groupSelected && groupSelected._id) {
            this.filteredParticipants =  this._study.StudyParticipants.filter((p)=> p.group._id === groupSelected._id);
            this.refreshUI();
        }
      
    }
    studyTagItemClick=()=> {
        console.log('study tag item click')
    }
    onTranslateClicked = async () => {
        const translatedTitle = await this._googleTranslate.translateToDefault(this.study.name);
        if (!translatedTitle.error) {
            this.study["translatedName"] = translatedTitle.body[0].translatedText;
        }
        const translatedObjective = await this._googleTranslate.translateToDefault(this.study.description);
        if (!translatedObjective.error) {
            this.study["translatedDescription"] = translatedObjective.body[0].translatedText;
        }
        if(!translatedObjective.error && !translatedTitle.error) {
            this.refreshUI();
        }
    }
    onStudyClicked=()=> {
        const isAdmin = (this.user && this.user.userType.toLowerCase() == UserType.ADMIN);
        const isClientAdmin = (this.user && this.user.userType.toLowerCase() == UserType.CLIENT_ADMINISTRATOR);
        if(isAdmin || isClientAdmin){
            const { history } = this.props;
            history.push(RoutesUtility.SETUP_STUDY(this.props.studyId));
        }
        else {
            // do nothing
        }

    }
    onParticipantsClicked=(participant)=> {
        const { history } = this.props;
        history.push(RoutesUtility.PARTICIPANT_PROFILE(participant));        
    }
    async onArchiveUnarchiveStudy() {
        const {studyId} = this.props;
        const archive = await this._study.archiveStudy(studyId, !this.study.isArchived);
        if (archive) {
            const response = await this._study.getStudyDetails(studyId);
            if (response) {
                this.study = Object.assign({}, response.body);
            }
            this.setState({ refresh: !this.state.refresh });
        }
    }

    logout() {
        this._cookieService.clearAll();
        CookieService.dispatchEvent(new Event(this._cookieService.USER_LOGIN_STATUS, "user logged out."));
        this.props.history.push(RoutesUtility.LOGIN());
        this._notifierService.showMessage({error:true}, '', Messages.authentication_failed);
    }
    async componentDidMount () {
        const {studyId, history} = this.props;
        if(this.user.userType.toLowerCase() !== UserType.ADMIN) {
            const isStudyAssinged = await this.isStudyAssingedToMe(studyId);
            if(!isStudyAssinged) {
                this.logout();
            }
        }
        this.setState({ fetching: true }, async () => {
            const groupResponse = await this._study.getStudyGroups(studyId);
            if (groupResponse && !groupResponse.error) {
                this._study.StudyGroups = groupResponse.body;
            }
            const tagResponse = await this._study.getStudyTags(studyId);
            if (tagResponse && !tagResponse.error) {
                this._study.StudyTags = tagResponse.data;
            }
            const resp = await this._study.getStudyDetails(studyId);
            const isStudyOutside = await this.isStudyOutsideOfOrganization(resp.body);
            if(isStudyOutside) {
                this.logout();
            }
            await this.fetchParticipants();
            if(resp && resp.body) {
                this.study = Object.assign({}, resp.body);
            }
            this.setState({ fetching: false });
        });
       
    }

    sortParticipants(key){
        this._study.sortParticipant(key);
    }

    fetchParticipants = async()=>{
        const { studyId } = this.props;
        await this._study.fetchStudyParticipants(studyId)
        this.refreshUI();
    }
    
    tagSaveClickHandler = async (tagData) => {
        const response = await this._study.saveEditedStudyTag(tagData);
        console.log(response);
    }

    tagDeleteClickHandler = async (tagData) => {
        const response = await this._study.deleteStudyTag(tagData._id);
        if (!response.error) {
            this._study.StudyTags = this._study.StudyTags.filter(tag => tag._id != tagData._id);
        }
    }

    onFilterClear = ()=>{
        this.filteredParticipants = null;
        this.refreshUI();
    }

    render() {
        const { studyId } = this.props;
        const isAdmin = (this.user && this.user.userType.toLowerCase() == UserType.ADMIN);
        const isClientAdmin = (this.user && this.user.userType.toLowerCase() == UserType.CLIENT_ADMINISTRATOR);
        const allowTagEditDelete = isAdmin || isClientAdmin;
        return (
            <div>
                <div className="breadcumbs">Studies</div>
                {
                    this.state.fetching?
                    <Loader/>
                    :<div className="study-view">
                        { this.study && <StudyCard
                            name={this.study.name}
                            study={{}}
                            isArchive={false}
                            participantCount={this._study.StudyParticipants.length || 0}
                            client={this.study.client.name}
                            date={moment(this.study.beginsOn).format("MMMM Do YYYY")}
                            brandImage={this.study.brandImageUrl}
                            imageObjectKey={this.study.imageObjectKey}
                            description={this.study.description}
                            archiveUnarchiveText={this.study.isArchived ? "Unarchive Study" : "Archive Study"}
                            onStudyClicked={() => this.onStudyClicked(this.study._id)}
                            onTranslateClicked={() => this.onTranslateClicked()}
                            onEditClicked={() => this.onStudyClicked(this.study._id)}
                            onArchiveUnarchiveStudy={(e) => this.onArchiveUnarchiveStudy(e, this.study._id)}
                            isAdmin={isAdmin || isClientAdmin}
                            edit={isAdmin || isClientAdmin}
                            translatedName={this.study.translatedName}
                            translateddescription={this.study.translatedDescription}
                        /> 
                        }

                        <div className="group-and-tag-list-container">
                            {/* here for both array should pass as props */}
                            <GroupsList 
                                groups={this._study.StudyGroups} 
                                groupItemClick={this.studyGroupItemClick}>
                            </GroupsList>
                            <div className="tag-list-container">
                                <TagList 
                                    tags={this._study.StudyTags}
                                    editDelete={allowTagEditDelete}
                                    tagSaveClickHandler={this.tagSaveClickHandler}
                                    tagDeleteClickHandler={this.tagDeleteClickHandler}
                                    tagItemClick={this.studyTagItemClick}>
                                </TagList>
                            </div>
                        </div>

                        <StudyPartcipants studyId={studyId}
                            participants={this.filteredParticipants || this._study.StudyParticipants} 
                            refetchParticipants={this.fetchParticipants}
                            filterApplied={this.filteredParticipants !== null}
                            clearFilter={this.onFilterClear}
                            sort={this.sortParticipants} />
                    </div>
                }
            </div>
        );
    }
}

export default Study;