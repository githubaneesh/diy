import React, { Component } from 'react';
import {FaSave, FaTrashAlt} from "react-icons/fa";
import './style.scss';

class AddGroup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            disableSave: true,
            refresh: false
          };
        this.selectedGroup = {
            name:'', 
            notes:'',
            introduction:'',
            criteria: {
              ageRange: {selected:false, value: '' },
              gender: {selected: false, value: '' },
              geography: {selected: false, value: '' },
              behavior: {selected: false, value: '' },
              groupSize: {selected: false, value: '' }
            }
          };
          if(this.props.modalType === "edit"){
            this.selectedGroup = JSON.parse(JSON.stringify(this.props.selectedGroup));
          }
        this.criterias = ["ageRange", "gender", "geography", "behavior", "groupSize"];
    }

    handleGroupNameChange = (e)=>{      
        this.selectedGroup.name = e.target.value;
        this.setState({refresh: !this.state.refresh, disableSave: this.isDisable});
    }

    handleCheckbox = (event, type)=>{
        this.selectedGroup.criteria[type].selected = event.target.checked;
        if(!this.selectedGroup.criteria[type].selected){
            this.selectedGroup.criteria[type].value = '';
        }
        this.setState({refresh: !this.state.refresh, disableSave: this.isDisable});
    }

    handleValues = (e, type)=>{
        this.selectedGroup.criteria[type].value = e.target.value;
        this.setState({refresh: !this.state.refresh, disableSave: this.isDisable});
    }

    saveGroup = () =>{
        this.props.onSave(this.selectedGroup);
    }

    handleNotesChange = (notes)=>{
        this.selectedGroup.notes = notes;
        this.setState({refresh: !this.state.refresh, disableSave: this.isDisable});
    }

    get isDisable() {
        let disable = false;
        if(!this.selectedGroup){
          return false;
        }
        let groupNameChanged = this.props.selectedGroup.name !== String(this.selectedGroup.name).trim()
        let criteraUpdated =  false;
        if(String(this.selectedGroup.name).trim() === ''){
            disable = true;
        }
        this.criterias.forEach((c)=>{
            
            if(this.props.modalType === "edit"){
                if(!criteraUpdated){
                    criteraUpdated = this.selectedGroup.criteria[c].value!== this.props.selectedGroup.criteria[c].value || this.selectedGroup.criteria[c].selected !== this.props.selectedGroup.criteria[c].selected;
                }
            }
        
            if((!this.selectedGroup.criteria[c].value && this.selectedGroup.criteria[c].selected)){
                criteraUpdated = false;
                disable = true;
                return true;
            }
        })

        if(this.props.modalType === "edit"){
            let notesUpdated = this.props.selectedGroup.notes !== this.selectedGroup.notes;
            let editDisable = (groupNameChanged || criteraUpdated || notesUpdated) ? false : true;
            return editDisable;
        }
        return disable;
    }

    render() {
        return (
            <div className="add-group">
                <div className="dialog-modal-content">
                    <div className="group-name">
                        <span className="label"> Group Name: </span>
                        <input type="text" required={true} onChange={this.handleGroupNameChange} defaultValue={this.selectedGroup.name}/>
                    </div>
                    <div className="rec-criteria">
                    <span className="label"> Recruitment Criteria (optional) </span>
                    <div className="recruitment-notes">
                        <span>Please check mark the specifications you would like to define and add notes on desired parameters.</span>
                    </div>
                    <div className="rec-criteria-inner">
                        <div>
                            <div>
                                <input type="checkbox" onChange={(e)=>{this.handleCheckbox(e,"ageRange")}} checked={this.selectedGroup.criteria.ageRange.selected} />
                            </div>
                            
                            <span>Age Range: </span>
                            <textarea cols="5" rows="3" disabled={!this.selectedGroup.criteria.ageRange.selected} 
                                    required={this.selectedGroup.criteria.ageRange.selected}
                                    value={this.selectedGroup.criteria.ageRange.value} 
                                    onChange={(e)=>{this.handleValues(e, "ageRange")}} >
                            </textarea>
                            
                           
                        </div>
                        <div>
                            <div>
                                <input type="checkbox" onChange={(e)=>{this.handleCheckbox(e,"gender")}} checked={this.selectedGroup.criteria.gender.selected} />
                            </div>
                            <span>Gender: </span>
                            <textarea cols="5" rows="3" disabled={!this.selectedGroup.criteria.gender.selected}
                                required={this.selectedGroup.criteria.gender.selected}
                                value={this.selectedGroup.criteria.gender.value} 
                                onChange={(e)=>{this.handleValues(e, "gender")}}></textarea>
                        </div>
                        <div>
                            <div>
                                <input type="checkbox" onChange={(e)=>{this.handleCheckbox(e,"geography")}} checked={this.selectedGroup.criteria.geography.selected} />
                            </div>
                            <span>Geography: </span>
                            <textarea cols="5" rows="3" disabled={!this.selectedGroup.criteria.geography.selected} 
                                required={this.selectedGroup.criteria.geography.selected}
                                value={this.selectedGroup.criteria.geography.value}  
                                onChange={(e)=>{this.handleValues(e, "geography")}}>
                            </textarea>
                        </div>
                        <div>
                            <div>
                                <input type="checkbox" onChange={(e)=>{this.handleCheckbox(e,"behavior")}} checked={this.selectedGroup.criteria.behavior.selected} />
                            </div>
                            <span>Behavioral Criteria: </span>
                            <textarea cols="5" rows="3" disabled={!this.selectedGroup.criteria.behavior.selected} 
                                required={this.selectedGroup.criteria.behavior.selected}
                                value={this.selectedGroup.criteria.behavior.value}   
                                onChange={(e)=>{this.handleValues(e, "behavior")}}>
                            </textarea>
                        </div>
                        <div>
                            <div>
                                <input type="checkbox" onChange={(e)=>{this.handleCheckbox(e,"groupSize")}} checked={ this.selectedGroup.criteria.groupSize ? this.selectedGroup.criteria.groupSize.selected : false} />
                            </div>
                            <span>Group Size: </span>
                            <textarea cols="5" rows="3" disabled={!this.selectedGroup.criteria.groupSize.selected} 
                                required={this.selectedGroup.criteria.groupSize.selected}
                                value={this.selectedGroup.criteria.groupSize.value}   
                                onChange={(e)=>{this.handleValues(e, "groupSize")}}>
                            </textarea>
                        </div>
                     </div>
                    </div>
                    <div className="aditional-notes">
                        <span className="label">Additional Notes:</span>
                        <textarea cols="5" rows="5" onChange={(event)=>{this.handleNotesChange(event.target.value)}} defaultValue={this.selectedGroup.notes}></textarea>
                    </div>
                </div>
                <div className="button-container text-right">
                    <button disabled={this.state.disableSave } className="button space-right" onClick={this.saveGroup}>
                        <FaSave /> <span>Save Group</span> 
                    </button>
                    {
                        this.props.modalType === "edit" 
                        && <button className="button space-left remove" onClick={this.props.onDelete} >
                            <FaTrashAlt /> <span>Delete Group</span>
                        </button>
                    }
                </div>
            </div>
        );
    }
}

export default AddGroup;