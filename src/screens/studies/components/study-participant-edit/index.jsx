import React, { Component } from 'react';
import "./style.scss";
import PropTypes from 'prop-types';
import Dropdown from '../../../widgets/dropdown';
import StudyParticipant from './studyParticipant';
import Utility from '../../../../utility/Utility';
import Loader from '../../../widgets/loader';

class StudyPartcipantEdit extends Component{

    _studyParticipant;
    _studyParticipantData = {};
    
    constructor(props){
        super(props);
        this.state = {
            refresh: false,
            prospect: props.selectedProspect,
            group: props.selectedGroup,
            disableSave: true
        }
        this._studyParticipant = new StudyParticipant(this);
    }

    componentDidUpdate(prevProps){
        if(this.props !== prevProps){
            this.setState({ prospect: this.props.selectedProspect, group: this.props.selectedGroup})
        }
    }

    refreshUI() {
        this.setState({ refresh: !this.state.refresh })
    }

    async componentDidMount(){
        const {studyId, type, existingParticipants} = this.props;
        if(studyId){
            await this._studyParticipant.init(studyId, type, existingParticipants);
        }
    }

    clearGroup = ()=>{
        this.setState({group: null, disableSave: true});
    }

    clearProspect = ()=>{
        this.setState({prospect: null, disableSave: true});
    }

    saveParticipant = async()=>{
        const {type, studyId} = this.props;
        let closeModal = true;
        if(type === "Add"){
            await this._studyParticipant.createParticipant(this.state.prospect.value, studyId, this.state.group.value);
        }
        else {
            closeModal = await this._studyParticipant.changeGroup(this.state.prospect.value, studyId, this.state.group.value);
        }
        if (closeModal) {
            this.props.closeModal();
            this.props.refetchParticipants();
        }
        
    }

    groupHandle = (selectedGroup) => {
        if(this.props.selectedGroup && selectedGroup.value === this.props.selectedGroup.value) {
            this.setState({group:selectedGroup, disableSave: true});
        }
        else {
            this.setState({group:selectedGroup, disableSave: this.state.prospect ? false : true});
        }
    }

    userHandle  = (selectedUser) => {
        this.setState({prospect:selectedUser, disableSave: this.state.group ? false : true});
    }
    
    render() {
        const {type} = this.props;
        return(
           <div className="participant-edit">
                <div className="title">{type === "Edit" ? "Edit Participant" : "Add Participant"}</div>
               <div className="participant-edit-inner">
                   <div>
                       {
                           (type === "Add") && (
                            <div className="dropdown-container">
                                <label className="label">Select a Group:</label>
                                <Dropdown selected={this.state.group}
                                    placeholder={""}
                                    onChangeHandle={this.groupHandle}
                                    clearable={true} 
                                    optionsData={Utility.convertToDisplayInDropDown(this._studyParticipant.studyGroups)} 
                                    clearSelectedOption={this.clearGroup}/>
                            </div>)
                       }
                        
                        <div className="dropdown-container">
                            <label className="label">Select a Prospect:</label>
                            {
                              <Dropdown selected={this.state.prospect}
                                    disabled={type === "Edit"}  
                                    onChangeHandle={this.userHandle}
                                    placeholder={""} 
                                    clearable={true} 
                                    optionsData={Utility.convertToDisplayInDropDown(this._studyParticipant.prospectUsers)} 
                                    clearSelectedOption={this.clearProspect} />
                            }
                        </div>
                    {
                        (type === "Edit") && (
                            <div className="dropdown-container">
                                <label className="label">Select a Group:</label>
                                <Dropdown selected={this.state.group}
                                    placeholder={""} 
                                    clearable={true} 
                                    onChangeHandle={this.groupHandle}
                                    optionsData={Utility.convertToDisplayInDropDown(this._studyParticipant.studyGroups)} 
                                    clearSelectedOption={this.clearGroup}/>
                            </div>)
                    }
                   </div>
                   
               
               <div className="button-container">
                   <button className="button cancel" onClick={()=>this.props.closeModal()}>Cancel</button>
                   <button className="button" disabled={this.state.disableSave} onClick={this.saveParticipant}>Submit</button>
               </div>
               </div>
           </div>
        )
    }

}

StudyPartcipantEdit.propTypes = {
    type: PropTypes.string,
    studyId: PropTypes.string,
    existingParticipants: PropTypes.array,
    selectedGroup: PropTypes.object,
    selectedProspect: PropTypes.object,
    refetchParticipants: PropTypes.func,
    closeModal: PropTypes.func

}

StudyPartcipantEdit.defaultProps = {
    type: "Add",
    selectedGroup: null,
    selectedProspect: null
}

export default StudyPartcipantEdit;