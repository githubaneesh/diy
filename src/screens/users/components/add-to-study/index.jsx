import React, { Component } from 'react';
import "./style.scss";
import { FaPlus, FaSave, FaTimes } from "react-icons/fa";
import Dropdown from '../../../widgets/dropdown';
import StudyService from '../../../../services/studyService';
import HttpService from '../../../../services/httpservice';
import NotifierService from '../../../../services/notifierService';
import Loader from '../../../widgets/loader';
import Utility from '../../../../utility/Utility';
import GroupService from '../../../../services/groupservice';
import ParticipantService from '../../../../services/participantService';
import { Messages } from '../../../../utility/Messages';

class AddToStudy extends Component {
    _httpService = HttpService.instance;
    _groupService = GroupService.instance;
    _notifierService = NotifierService.instance;
    _participantService = ParticipantService.instance;

    selectedStudy = null;
    selectedGroup = null;
    studyList = [];
    groupList = [];

    constructor(props) {
        super(props);
        this.state = {
            active: false,
            fetching: false,
            edit: false
        }
    }

    componentWillReceiveProps() {
        const { participant } = this.props;
        if(participant && participant.study && participant.group) {
            this.getStudyGroups(participant.study._id);
            this.selectedGroup = {value: participant.group._id, label: participant.group.name}
            this.setState({edit: true, active: true});
        }
    }
    handleAddtoStudyClick=()=> {
        this.setState({active: true, fetching: this.studyList.length?false:true}, ()=> {
            if(!this.studyList.length) {
                this.getStudyList();
                this.setState({fetching: false});
            }
        });
    }
    async getStudyList(){
        const requestUrl = StudyService.STUDY_LIST();
        const response =  await this._httpService.requestV3Server(HttpService.GET, requestUrl,null);
        this.studyList = Utility.convertToDisplayInDropDown(response.body);
        this.setState({fetching: false});
    }
    async getStudyGroups(study){
        const response = await this._groupService.getStudyGroups(study);
        this.groupList = Utility.convertToDisplayInDropDown(response.body);
        const { participant } = this.props;
        if(participant && participant.group) {
            this.selectedGroup = {value: participant.group._id, label: participant.group.name}
        }
        this.setState({fetching: false});
    }
    studySelect=(study)=> {
        this.groupList = [];
        this.selectedStudy = study.value;
        this.getStudyGroups(study.value);
    }
    groupSelect=(group)=> {
        this.selectedGroup = group.value;
    }
    handleClearStudy = ()=>{
        this.selectedStudy = null;
        this.selectedGroup = null;
        this.groupList = [];
        this.setState({fetching: false});
    }
    handleClearGroup = ()=>{
        this.selectedGroup = null;
        this.setState({fetching: false});
    }
    handleCancelClick=()=> {
        this.groupList = [];
        this.props.onCancelClick();
        this.setState({active: false});
    }
    createParticipant=async()=> {
        const postContent = {
            user: this.props.user._id,
            study: this.selectedStudy,
            isNew: true,
            group: this.selectedGroup            
        }      

        if(!this.selectedGroup) {
            this._notifierService.showMessage({error:true},'', Messages.all_mandatory);
            return;
        }

        const response = await this._participantService.createParticipant(postContent);
        this.setState({active: false});
        this.props.onParticipantCreate();

    }
    getUserFullName(data) {
        return data.firstName+" "+data.lastName
    }
    render() {
        return (
            <div className="add-to-study">
                {
                    this.state.fetching?<Loader/>
                    :<div>
                        {
                            !this.state.active ?
                            <button onClick={this.handleAddtoStudyClick} className="button">
                                <FaPlus/>
                                &nbsp;<span className="title-inner">Add to Study</span>
                            </button>
                            :<div className="add-to-study-inner">
                                <div className="grid-item capitalize">
                                    <div className="label">Select a Prospect</div>
                                    <input type="text" value={this.getUserFullName(this.props.user)} disabled/>
                                </div>
                                <div className="grid-item">
                                    <div className="label">Select Study</div>
                                    {
                                        this.state.edit?
                                        <input value={(this.props.participant && this.props.participant.study) ?this.props.participant.study.name:""} disabled/>
                                        :<Dropdown defaultOptionText=""
                                            optionsData={this.studyList}
                                            onChangeHandle={this.studySelect}
                                            clearable={true}
                                            clearSelectedOption={this.handleClearStudy}
                                            placeholder={""}>
                                        </Dropdown>
                                    }
                                </div>
                                <div className="grid-item">
                                    <div className="label">Select a Group</div>
                                    <Dropdown defaultOptionText=""
                                            selected={this.selectedGroup}
                                            optionsData={this.groupList}
                                            onChangeHandle={this.groupSelect}
                                            clearable={true}
                                            clearSelectedOption={this.handleClearGroup}
                                            placeholder={""}>
                                    </Dropdown>
                                </div>
                                <div className="grid-item">
                                    <div className="action-container">
                                        <button disabled={!this.selectedStudy && !this.selectedGroup} className="button" onClick={this.createParticipant}><FaSave/></button>
                                        <button className="button" onClick={this.handleCancelClick}><FaTimes/> Cancel</button>
                                    </div>
                                </div>
                            </div> 
                        }
                    </div>
                }
            </div>
        );
    }
}

export default AddToStudy;