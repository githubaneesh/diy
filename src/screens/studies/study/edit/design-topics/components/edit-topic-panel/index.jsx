import React, { Component } from 'react';
import './style.scss';
import ToggleSwitch from '../../../../../../widgets/toggle-switch';
import DropdownMultiSelect from "../../../../../../widgets/dropdown-multiselect";
import AutoSaveTextArea from '../../../../../../widgets/auto-save-textarea';
import Move from '../../../../../../widgets/move';
import Dropdown from '../../../../../../widgets/dropdown/index';
import { FaTrashAlt } from "react-icons/fa";
import TopicService from "../../../../../../../services/topicservice";
import NotifierService from '../../../../../../../services/notifierService';
import DialogModal from '../../../../../../widgets/dialog-modal';
import Utility from '../../../../../../../utility/Utility';
import { Messages } from '../../../../../../../utility/Messages';
import Loader from '../../../../../../widgets/loader';

class EditTopicPanel extends Component {
    _topicService = TopicService.instance;
    _notifierService = NotifierService.instance;
    userChangedObject={};

    constructor(props){
        super(props);

        this.state = {
            topicName : props.topicData.title,
            topicStyle: props.topicData.title_styles,
            topicInstructions : props.topicData.instructions || '',
            prerequisites:[],
            enabled: props.topicData.isEnable !== undefined ? props.topicData.isEnable : true,
            _id: props.topicData._id,
            selectedGroupId : props.selectedGroup._id,
            showDeletePopup: false,
            untilEnable:  props.topicData.untilEnable !== undefined ? props.topicData.untilEnable : false,
            fetching: false,
            disableSwitch:  props.topicData.postsCount>0?true:false
        }

        this. userChangedObject["_id"] = props.topicData._id;
        
    }
    handleUntilEnabledChange=(bool)=> {
        
        //#571 - lock Until Enabled to be worked every time
        this.setState({untilEnable: bool},()=>{
            this.setState({enabled: !this.state.untilEnable, disableSwitch: !this.state.untilEnable}, ()=> {
                this.userChangedObject["untilEnable"] = bool;
                this.userChangedObject["isEnable"] = !this.state.untilEnable;
                this.props.saveUpdatedTopic(this.userChangedObject)
            });

            // if(this.props.topicData.postsCount < 1 || this.props.topicData.postsCount == undefined) {
            //     this.setState({enabled: !this.state.untilEnable, disableSwitch: !this.state.untilEnable}, ()=> {
            //         this.userChangedObject["untilEnable"] = bool;
            //         this.userChangedObject["isEnable"] = !this.state.untilEnable;
            //         this.props.saveUpdatedTopic(this.userChangedObject)
            //     });
            // }
            // else {
            //     this.props.saveUpdatedTopic(this.userChangedObject)
            // }
        })
    }
    onTopicSelectHandle = (list) => {
        this.setState({prerequisites : list}, ()=>{
            this.props.saveUpdatedPrequisites(this.state)
        })
    }
    componentDidMount() {
        this.setState({disableSwitch: !this.state.untilEnable})
    }

    switchHandleChange=(e)=>{
        this.setState({enabled: e},()=>{
            this.userChangedObject["isEnable"] = e;
            this.props.saveUpdatedTopic(this.userChangedObject)
        });
    }

    onTopicInstructionsSave = (e) => {
        this.setState({topicInstructions: e}, ()=>{
            this.userChangedObject["instructions"] = e;
            this.props.saveUpdatedTopic(this.userChangedObject);
        });
    }

    handleError=()=> {
        this._notifierService.showMessage({error:true}, '', Messages.require_topic_name);

    }
    onTopicNameSave = (e) => {
        this.setState({topicName: e}, ()=>{
            this.userChangedObject["title"] = e;
            this.props.saveUpdatedTopic(this.userChangedObject);
        });
    }

    copyToHandler = (group) => {
        this.props.copyTopicHandler(group, this.props.topicData._id);
    }

    onUpArrowClick = () => {
        this.props.moveTopicHandler("up")
    }

    onDownArrowClick = () => {
        this.props.moveTopicHandler("down")
    }

    onDelete= () => {
        this.setState({showDeletePopup: true});
    }

    onTopicDelete = ()=>{
        this.setState({fetching: true}, async()=>{
            const response = await this._topicService.deleteTopic(this.props.topicData._id);
            this._notifierService.showMessage(response, Messages.topic_delete);
            if(!response.error) {
                this.setState({showDeletePopup: false, fetching: false},()=>{
                    this.props.onDelete(this.props.topicData);
                });
            } 
            else {
                this.setState({showDeletePopup: false, fetching: false});
            }
        })
        
    }

    closeDeletePopup = ()=>{
        this.setState({showDeletePopup: false});
    }

    render(){

        const {lockTopicData, topicData} = this.props;
        return(
            
            <div className="edit-topic-panel">
                <div className="tab">
                    <div className="content show">
                        <div>
                            <div className="topic-name-container">
                                <div className="container-left">
                                    <AutoSaveTextArea
                                        rows={2}
                                        title={"Edit Topic Name"}
                                        textValue = {Utility.topicTitleStyle(topicData)}
                                        emptyAllowed = {false}
                                        onError={this.handleError}
                                        saveData = {this.onTopicNameSave}>
                                    </AutoSaveTextArea>
                                </div>
                                <div className="container-right">
                                    <div className={this.state.disableSwitch?"switch-container disabled":"switch-container"}>
                                        <ToggleSwitch 
                                                switchLabel={"Manual Topic Unlock"} 
                                                defaultChecked = {this.state.enabled}
                                                handleChange={this.switchHandleChange}>
                                        </ToggleSwitch>
                                    </div>
                                    {
                                        <Move
                                            topicId = {topicData._id}
                                            onUpArrowClick = {this.onUpArrowClick}
                                            onDownArrowClick = {this.onDownArrowClick}>   
                                        </Move>
                                    }
                                </div>
                                <div className="clear-fix"></div>
                            </div>
                            <div className="instruction-container">
                                <div className="container-left">
                                    <AutoSaveTextArea
                                        rows={4}
                                        title={"Add/Edit Topic Instructions (optional)"}
                                        editorStyle={{width: '100%'}}
                                        textValue = {this.state.topicInstructions}
                                        saveData = {this.onTopicInstructionsSave}>
                                    </AutoSaveTextArea>
                                </div>
                                <div className="container-right">
                                    <div className="container-right-inner">
                                        <button className="button delete" onClick={this.onDelete}><FaTrashAlt/> <span>Delete Topic</span></button>
                                        <div className="dropdown-area">
                                            {
                                         //   topicData.sequence > 1 && 
                                            <DropdownMultiSelect
                                                placeholder="Lock Topic" 
                                                optionsData={topicData.sequence > 1 ?lockTopicData : []} 
                                                selected = {this.props.prequisitesData}
                                                onChangeHandle={this.onTopicSelectHandle}
                                                onUntilEnabledChange={this.handleUntilEnabledChange}
                                                untilEnabledSelected={this.props.topicData.untilEnable}
                                                uniqueId={this.props.topicData._id}
                                                untilEnabled={true}>
                                            </DropdownMultiSelect>
                                            }
                                            <Dropdown 
                                                defaultOptionText="Copy To Group" 
                                                optionsData={this.props.groupsdata} 
                                                onChangeHandle={this.copyToHandler}
                                                placeholder={"Copy to..."}>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
                                <div className="clear-fix"></div>
                            </div>    
                        </div>
                    </div>                    
                </div>
                                            
                <div >
                    <DialogModal className="delete-modal" showModal={this.state.showDeletePopup} modalCloseHandler={this.closeDeletePopup} refresh={this.state.fetching}>
                        <div className="modal-header"><h3> Deleting A Topic</h3></div>
                        <div className="modal-body">
                            <p> Deleting a topic is permanent and cannot be undone! <br/> All included questions and all associated participant responses will be lost. Are you sure?</p>
                        </div>
                        <div className="modal-footer text-right">
                            {
                                this.state.fetching ?
                                    <div>
                                        <Loader className="loader" />
                                    </div>
                                : <div className="button-group">
                                        <button className="button" onClick={this.onTopicDelete}> Yes</button>
                                        <button className="button space-left" onClick={this.closeDeletePopup}>No</button>
                                  </div>
                            }
                        </div>
                    </DialogModal>
                </div>
            
            </div>
        )
    }

  

}

export default EditTopicPanel;
