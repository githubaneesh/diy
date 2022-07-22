import React, { Component } from 'react';
import PropTypes from 'prop-types';
import "./style.scss";
import { FaSort } from 'react-icons/fa';
import moment from 'moment';
import DialogModal from '../../../widgets/dialog-modal';
import StudyPartcipantEdit from '../study-participant-edit';
import AddPost from '../add-post';
import { Link } from 'react-router-dom';
import CookieService from '../../../../services/cookieservice';
import UserType from '../../../../common/userType';

const _cookieService = CookieService.instance;
class StudyPartcipants extends Component{

    selectedUser;
    selectedGroup;
    _user;
    constructor(props){
        super(props);
        this.state = {
            showModal: false,
            type:"Add",
            showAddPostModal: false
        }
        this.renderTable = this.renderTable.bind(this);
        this.renderStudyParticipantModal = this.renderStudyParticipantModal.bind(this);
        this.renderAddPostModel = this.renderAddPostModel.bind(this);
        this.sort = this.sort.bind(this);
    }

    sort(key) {
        this.props.sort(key);
    }

    renderTable(showEdit) {
        const { participants } = this.props;
        this._user = _cookieService.user;
        const showFullParticipantName = (this._user && (this._user.userType.toLowerCase() === UserType.ADMIN));
        return (<div className="participants-list">
                    <table className="participants-table">
                        <thead>
                            <tr>
                                <th onClick={()=>{this.sort("name")}}> <span className="sortable"> Name <FaSort /></span> </th>
                                <th onClick={()=>{this.sort("groupName")}}> <span className="sortable"> Group <FaSort /></span></th>
                                <th> <span> Last Updated </span></th>
                                <th> <span> # Posts </span> </th>
                                {
                                    showEdit && (<th> <span> Edit </span></th>)
                                }
                                
                            </tr>
                        </thead>
                        <tbody>
                            {
                                participants && participants.length > 0 
                                ? participants.map((participant) => participant.participant && <tr key={participant._id}>
                                    <td> 
                                        <Link className="capitalize" to={`/participant/${participant.participant}`}> 
                                            { showFullParticipantName ?  participant.user.name 
                                                : `${participant.user.firstName} ${participant.user.lastName.charAt(0).toUpperCase()}`} 
                                        </Link> 
                                    </td>
                                    <td> {(participant.group) ? participant.group.name : 'N/A'} </td>
                                    <td> {participant.lastUpdated ? moment(participant.lastUpdated).fromNow() : '-'} </td>
                                    <td> {participant.postCount} </td>
                                    {
                                        showEdit && (<td> 
                                            <span className="clickable" 
                                                onClick={()=>{this.handleEditParticipantClick(participant.user, participant.group)}}> 
                                                Edit </span> 
                                        </td>)
                                    }
                                    
                                </tr>)
                                : <tr><td colSpan="5"> {`No participants enrolled in this study.`} </td></tr>
                            }
                        </tbody>
                    </table>
               
                </div>)
    }

    handleAddParticipantClick = ()=>{
        this.setState({type: "Add", showModal: true})
    }

    handleAddPostClick = () => {
        this.setState({ showAddPostModal: true })
    }

    handleEditParticipantClick = (user, group)=>{
        if (group) {
            this.selectedGroup = {};
            this.selectedGroup["value"] = group._id;
            this.selectedGroup["label"] = group.name;
        }
        if(user) {
            this.selectedUser = {};
            this.selectedUser["value"] = user._id;
            this.selectedUser["label"] = user.name;
        }
        this.setState({type: "Edit", showModal: true})
    }

    closeModal = () => {
        this.selectedUser = undefined;
        this.selectedGroup = undefined;
        this.setState({ showModal: !this.state.showModal });
    }

    closeAddPostModal = () =>{
        this.setState({ showAddPostModal: false });
    }

    renderStudyParticipantModal(){
        const { studyId, participants } = this.props;
       return (
        <DialogModal className="study-participant-modal" showModal={this.state.showModal} modalCloseHandler={this.closeModal}>
           {
              <StudyPartcipantEdit 
                type={this.state.type}
                studyId={studyId}
                existingParticipants={participants}
                selectedGroup={this.selectedGroup} 
                selectedProspect={this.selectedUser}
                closeModal={this.closeModal} 
                refetchParticipants={this.props.refetchParticipants}/>
           }
       </DialogModal>
       )
    }

    renderAddPostModel() {
        const { studyId, participants } = this.props;
        return (
            <DialogModal className="add-post-modal" showModal={this.state.showAddPostModal} modalCloseHandler={this.closeAddPostModal}> 
                {
                    <AddPost 
                        participants={participants} 
                        studyId={studyId}
                        refetchParticipants={this.props.refetchParticipants}
                        closeModal={this.closeAddPostModal} />
                }
            </DialogModal>
        );
    }


    render(){
        this._user = _cookieService.user;
        const showAddPhotoVideo = (this._user && (this._user.userType.toLowerCase() === UserType.ADMIN || this._user.userType.toLowerCase() === UserType.MODERATOR || this._user.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR));
        const showAddEditParticipant = (this._user && this._user.userType.toLowerCase() === UserType.ADMIN);
        return (
            <div className="study-participants">
                <div className="title-container">
                    <div className="title-text">
                        <span className="title"> Study Participants </span>
                    </div>
                    <div className="text-right">
                        { (this.props.filterApplied) && <span className="clickable" onClick={this.props.clearFilter}>Clear Filter</span>}
                        { showAddPhotoVideo && (<span className="clickable" onClick={this.handleAddPostClick}>Send Photo or Video to Group</span>) }
                        { showAddEditParticipant && (<span className="clickable" onClick={this.handleAddParticipantClick}>+ Add Participant</span>) }
                    </div>
                </div>
                {this.renderTable(showAddEditParticipant)}
                { this.renderStudyParticipantModal() }
                { this.renderAddPostModel() }
            </div>
        )
    }

}

StudyPartcipants.propTypes = {
    participants: PropTypes.array,
    studyId: PropTypes.string,
    refetchParticipants: PropTypes.func,
    sort: PropTypes.func,
    filterApplied: PropTypes.bool,
    clearFilter: PropTypes.func
}

export default StudyPartcipants;