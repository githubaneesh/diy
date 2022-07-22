import React, { Component } from 'react';
import "./style.scss";
import PropTypes from 'prop-types';
import Dropdown from '../../../widgets/dropdown';
import Upload from '../../../widgets/upload';
import AddPostController from './addPost';
import Utility from '../../../../utility/Utility';
import ParticipantMultiSelect from '../participant-multiselect';
import Media from '../../../widgets/media';
import Loader from '../../../widgets/loader';

class AddPost extends Component{

    _addPostController;

    constructor(props){
        super(props);
        this.state = {
            refresh: false,
            disableSave: true,
            savingPost: false
        }

        this.setSaveButtonStatus = this.setSaveButtonStatus.bind(this);
        this.handlePostSaveClick = this.handlePostSaveClick.bind(this);
        this._addPostController = new AddPostController(this);
    }

    refreshUI(){
        this.setState({refresh: !this.state.refresh});
    }

    setSaveButtonStatus(status:Boolean) {
        this.setState({disableSave: status});
    }
    
    async componentDidMount(){
        const {studyId, participants, groupId} = this.props;
        await this._addPostController.init(studyId, participants, groupId);
    }

    handlePostSaveClick() {
        this.setState({savingPost: true}, async()=>{
           await this._addPostController.savePost();
         
            this.setState({ savingPost: false }, ()=>{
                this.props.closeModal();
                if (this.props.refetchParticipants) {
                        this.props.refetchParticipants();
                }
                if (this.props.refetchPosts) {
                        this.props.refetchPosts();
                }
             });
         
        })
    }

    render(){
        return(
            <div className="Add-Post-Container">
                <div className="title">
                    <span>Create Post</span>
                </div>
                {
                    this.state.savingPost 
                    ? <div>
                        <span>Saving Post <Loader /></span>
                    </div>
                    :<div>
                        <div>
                            <div >
                                <div className="media-container">
                                    <label className="label text-muted">Add Image or Video:</label>
                                    <br />
                                    {
                                        !this._addPostController.isMediaAllowed
                                            ? <span className="blacktxt">Media is not allowed for this question</span>
                                            : <div className="media-uploaded">
                                                {
                                                    Utility.isValidUrl(this._addPostController._selectedFile)
                                                        ? <Media 
                                                            Uploaded={true} 
                                                            edit={true} 
                                                            url={this._addPostController._selectedFile} 
                                                            showStatus={false}
                                                            showDeletePopup={false} 
                                                            handleDelete={() => this._addPostController.handleDeleteMedia()} />
                                                        : <Upload onChangeHandler={this._addPostController.uploadMediaHandler}
                                                            type="image/png,image/jpeg,video/mp4,video/ogg,video/webm"
                                                            iconType="image"
                                                            label="Click to Add a File" />

                                                }
                                            </div>
                                    }
                                </div>
                                <div className="dropdown-wrapper">
                                    <div>
                                        <label className="label text-muted">Add Topic:</label>
                                        <Dropdown
                                            placeholder={""}
                                            clearable={true}
                                            clearSelectedOption={() => this._addPostController.clearTopic()}
                                            optionsData={Utility.convertTopicsToDisplayInDropDown(this._addPostController.studyTopics)}
                                            onChangeHandle={(topic) => { this._addPostController.handleTopicChange(topic, this.props.type) }} >
                                        </Dropdown>
                                    </div>
                                    <div>
                                        <label className="label text-muted">Add Question:</label>
                                        <Dropdown
                                            placeholder={""}
                                            clearable={true}
                                            disabled={this._addPostController.selectedTopic === undefined}
                                            clearSelectedOption={() => this._addPostController.clearQuestion(this.props.type)}
                                            optionsData={Utility.convertQuestionsToDisplayInDropDown(this._addPostController.studyQuestions)}
                                            onChangeHandle={(question) => { this._addPostController.handleQuestionChange(question, this.props.type) }} >
                                        </Dropdown>
                                    </div>
                                    <div>
                                        <label className="label text-muted">Add Group:</label>
                                        <Dropdown
                                            placeholder={""}
                                            clearable={true}
                                            selected={this.props.selectedGroup}
                                            disabled={this.props.type === "participant" || this._addPostController.selectedQuestion === undefined}
                                            clearSelectedOption={() => this._addPostController.clearGroup()}
                                            optionsData={Utility.convertToDisplayInDropDown(this._addPostController.studyQuestionGroups)}
                                            onChangeHandle={(group) => { this._addPostController.handleGroupChange(group) }} >
                                        </Dropdown>
                                    </div>
                                    <div>
                                        <ParticipantMultiSelect
                                            participants={this._addPostController.groupParticipants}
                                            disableRemove={this.props.type === "participant"}
                                            removeParticipant={this.props.type === "participant" ? undefined : (participant) => { this._addPostController.removeParticipant(participant) }} />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Comment: </label>
                                    <textarea onChange={(event) => this._addPostController.commentChange(event)} disabled={!this._addPostController.isTextAllowed} rows="3"></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="button-container">
                            <button className="button cancel" onClick={() => this.props.closeModal()}>Cancel</button>
                            <button className="button" disabled={this.state.disableSave} onClick={this.handlePostSaveClick}>Submit</button>
                        </div>
                    </div>
                }

            </div>
        );
    }

}

AddPost.propTypes = {
    participants: PropTypes.any,
    type:PropTypes.string,
    studyId: PropTypes.string,
    closeModal: PropTypes.func,
    refetchParticipants: PropTypes.func,
    refetchPosts: PropTypes.func,
    groupId: PropTypes.any,
    selectedGroup: PropTypes.any
}

AddPost.defaultProps = {
    refetchParticipants: undefined,
    refetchPosts: undefined,
    groupId: undefined,
    selectedGroup: undefined
}

export default AddPost;