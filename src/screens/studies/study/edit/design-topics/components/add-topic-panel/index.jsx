import React, { Component } from 'react';
import './style.scss';
import PanelTextArea from '../../../../../../widgets/panel-textarea';
import ToggleSwitch from '../../../../../../widgets/toggle-switch';
import DropdownMultiSelect from "../../../../../../widgets/dropdown-multiselect";
import { FaWindowMinimize, FaPlus} from "react-icons/fa";
import Loader from '../../../../../../widgets/loader';

class AddTopicPanel extends Component {
    constructor(props){
        super(props);

        this.state = {
            topicName : '',
            topicInstructions : '',
            active : false,
            selectedTopics:[],
            untilEnable: false,
            enabled: true,
            isFetching: false
        }

        this.onTopicSelectHandle = this.onTopicSelectHandle.bind(this);
        this.onAddNewTopicClick = this.onAddNewTopicClick.bind(this);
    }

    onAddNewTopicClick(){
        this.setState({
            active : !this.state.active,
            isFetching: false,
            topicName : '', 
            topicInstructions : '',
            selectedTopics:[], 
            enabled: true
        })
    }

    handleUntilEnabledChange=(bool)=> {
        this.setState({untilEnable: bool, enabled: this.state.untilEnable})
    }
    onTopicSelectHandle=(selectedList)=>{
        this.setState({selectedTopics: selectedList});

    }

    switchHandleChange=(e)=>{
        this.setState({enabled: e});
    }

    topicNameHandler=(content)=> {
        this.setState({topicName: content});
    }

    topicInstructionHandler=(content)=> {
        this.setState({topicInstructions: content});
    }
    
    saveHandler= async()=> {


        this.setState({isFetching: true}, ()=>{
            this.props.saveHandler({
                topicName: this.state.topicName,
                topicInstructions: this.state.topicInstructions,
                selectedTopics: this.state.selectedTopics,
                untilEnable: this.state.untilEnable,
                enabled: this.state.enabled
            });
        });
       
    }

    render(){
        const {groupsdata, topicsData} = this.props;
        return(
            <div className="add-topic-panel">
                <div className="tab">
                    <div className="title flex" onClick={this.onAddNewTopicClick}>
                        <span className="space-right">{this.state.active?<FaWindowMinimize className="adjust-top"/>:<FaPlus/>}</span>
                        <span className="space-left">ADD NEW TOPIC</span>
                    </div>
                    <div className={this.state.active ? "content show" : "content hide"}>
                        <div>
                            <div>
                                <PanelTextArea 
                                    labelText={'Add Topic Name'} 
                                    editorStyle={{width: '50%'}}
                                    textValue={this.state.topicName}
                                    changeHandler={this.topicNameHandler}>
                                </PanelTextArea>
                            </div>
                            <div className="instruction-container">
                                <div className="container-left">
                                    <PanelTextArea 
                                            labelText={'Add Topic Instructions (optional)'} 
                                            rows={"4"}
                                            textValue={this.state.topicInstructions}
                                            changeHandler={this.topicInstructionHandler}>
                                    </PanelTextArea>
                                </div>
                                <div className="container-right">
                                    <div className="container-right-inner">
                                        <div className={this.state.untilEnable?"switch-container":"switch-container disabled"}>
                                            <ToggleSwitch 
                                                switchLabel={"Manual Topic Unlock"}
                                                defaultChecked={this.state.enabled}
                                                handleChange={this.switchHandleChange}>
                                            </ToggleSwitch>
                                        </div>

                                        <div className="space-top">
                                            <DropdownMultiSelect
                                                placeholder="Lock Topic" 
                                                optionsData={topicsData} 
                                                onChangeHandle={this.onTopicSelectHandle}
                                                onUntilEnabledChange={this.handleUntilEnabledChange}
                                                uniqueId={'add-topic-panel'}
                                                untilEnabled={true}>
                                            </DropdownMultiSelect>
                                        </div>          
                                    </div>       
                                </div>
                                <div className="clear-fix"></div>
                            </div>            
                        </div>
                        <div>
                            {
                                this.state.isFetching?
                                <Loader/> :
                                <button className="button"
                                disabled={ this.state.topicName === 'null' || String(this.state.topicName).trim() === ''}
                                onClick={this.saveHandler}>Save</button>
                            }
                        </div>
                    </div>                    
                </div>
            </div>
        );
    }

}

export default AddTopicPanel;