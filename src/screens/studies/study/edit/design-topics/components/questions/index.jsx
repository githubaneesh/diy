import React, { Component } from 'react';
import './style.scss';
import Question from './question/index';
import AddQuestion from './add-question/index';
import DialogModal from '../../../../../../widgets/dialog-modal';
import Dropdown from '../../../../../../widgets/dropdown';
import QuestionsController from "./questions";
import Utility from "../../../../../../../utility/Utility";
import TranscribeLanguage from "../../../../../../../common/constants";

class Questions extends Component {

    _selectedTranscribeLanguage;
    _disableTranscribeLanguageDropdown = false;
    _previousSelectedLanguage;
    _requestingChild;
    _questionLang;
    _addQuestionTranscribe;
    constructor(props){
        super(props)
        this.state = {
            nextQuestionTag : null,
            addStatus: false,
            showDeletePopup: false,
            showTranscribePopup: false,
            refresh: false
        }
        this._controller = new QuestionsController(this);
        this.deleteQuestionId = ''; 
        this.deletedQuestionGroup = '';
        this.deleteQuestionData = {};
        this.handleAddQuestionClick = this.handleAddQuestionClick.bind(this);
        this.renderTranscribeLanguagesModal = this.renderTranscribeLanguagesModal.bind(this);
        this.defaultTranscribeLanguage = this.defaultTranscribeLanguage.bind(this);
        this.handleConfirmClick = this.handleConfirmClick.bind(this);
    }

    async handleAddQuestionClick() {
        await this._controller.getTranscribeLanguages();
        this._addQuestionTranscribe = this.defaultTranscribeLanguage(this.props.studyTranscribeLanguage);
        this._selectedTranscribeLanguage = this._addQuestionTranscribe;
        this._previousSelectedLanguage = this._selectedTranscribeLanguage
        this.setState({ 
                nextQuestionTag: this.nextQuestionTag,
                addStatus: true
            });
    }

    onQuestioncDelete = async()=>{
        const response = await this.props.onDelete(this.deleteQuestionId, this.deletedQuestionGroup, this.deleteQuestionData);
        this.closeDeletePopup();
        return response;
    }

    deleteButtonClick = (questionId, questionGroup, questionData)=>{
        this.deleteQuestionId = questionId; 
        this.deletedQuestionGroup = questionGroup;
        this.deleteQuestionData = questionData;
        this.showDeletePopup();
    }

    showDeletePopup = ()=>{
        this.setState({showDeletePopup: true});
    }

    handleOpenTranscribePopup = async (viewType, selectedLanguage=TranscribeLanguage.DEFAULT, questionId) =>{
        // Fetch latest transcribe languages
        await this._controller.getTranscribeLanguages();
        // disable dropdown option if viewQuestion mode
        this._disableTranscribeLanguageDropdown = false;
        if (viewType=="viewQuestion") {
            this._disableTranscribeLanguageDropdown = true;
        }
        if(viewType == "editQuestion" || viewType == "viewQuestion") {
            this._requestingChild = questionId;
            // set selected transcribe language
            this._selectedTranscribeLanguage = this.defaultTranscribeLanguage(this._questionLang[this._requestingChild] || this.props.studyTranscribeLanguage);
            this._previousSelectedLanguage = this._selectedTranscribeLanguage;
        }
        else {
            // set selected transcribe language
            this._selectedTranscribeLanguage = this._addQuestionTranscribe;
            //this._addQuestionTranscribe = this._selectedTranscribeLanguage;
            this._previousSelectedLanguage = this._selectedTranscribeLanguage;
        }
        // show popup
        this.setState({showTranscribePopup: true})
    }

    closeDeletePopup = ()=>{
        this.setState({showDeletePopup: false});
        this.deleteQuestionId = ''; 
        this.deletedQuestionGroup = '';
        this.deleteQuestionData = {};
    }

    closeTranscribePopup = ()=>{
        this._selectedTranscribeLanguage = this._previousSelectedLanguage;
        if(this._requestingChild) {
            this._requestingChild = null;
        }
        else {
            this._addQuestionTranscribe = this._selectedTranscribeLanguage;
        }
        this.setState({showTranscribePopup: false})
    }
    
    handleAddQuestionClose = ()=>{
        this.setState({ nextQuestionTag: null, addStatus: false });
        this._addQuestionTranscribe = null;
    }

    get nextQuestionTag(){
        let nextQuestionIdChar;
        let questionsLength = this.props.questionsData.length;
        if(questionsLength > 0){
            let lastQuestion = this.props.questionsData[questionsLength - 1];
            let lastQuestionIdChar = lastQuestion.qSequence;
            nextQuestionIdChar = parseInt(lastQuestion.uiTag) + String.fromCharCode((lastQuestionIdChar.charCodeAt(0) + 1));
        }
        else {
            nextQuestionIdChar =  this.props.topicSequence.toString() + 'a';
        }

        return nextQuestionIdChar;
    }

    handleDropdownChange = (selectedLanguage) => {
        this._selectedTranscribeLanguage = selectedLanguage;
        if(!this._requestingChild) {
            this._addQuestionTranscribe = this._selectedTranscribeLanguage;
        }
        this.setState({refresh: !this.state.refresh})
    }

    handleConfirmClick() {
        if(this._requestingChild) {
            this._questionLang[this._requestingChild] = this._selectedTranscribeLanguage.value;
            this._requestingChild = null;
        }
        this.setState({showTranscribePopup: false});
    }

    renderTranscribeLanguagesModal() {
        return (
            <div>
                <DialogModal className="transcribe-modal" showModal={this.state.showTranscribePopup} refresh={true} modalCloseHandler={this.closeTranscribePopup} >
                    <div className="modal-header"><h3>Language</h3></div>
                    <div className="modal-body">
                        <Dropdown
                            optionsData={Utility.convertToDisplayInDropDown(this._controller.transcribeLangauges)}
                            onChangeHandle={this.handleDropdownChange}
                            selected={this._selectedTranscribeLanguage}
                            disabled={this._disableTranscribeLanguageDropdown}
                            placeholder={""} />
                    </div>
                    {
                        !this._disableTranscribeLanguageDropdown
                            && (<div className="modal-footer text-right">
                                    <div className="button-group">
                                        <button className="button" onClick={this.handleConfirmClick}>
                                            Confirm
                                        </button>
                                    </div>
                                </div>)
                    }     
                </DialogModal>
            </div>
        )
    }

    defaultTranscribeLanguage(selectedLanguage=TranscribeLanguage.DEFAULT) {
        let defaultLanguage;
        for (var lang of this._controller.transcribeLangauges) {
            // selectedLanguage is id if already present in question else it is default language code
            if (selectedLanguage == lang._id || selectedLanguage == lang.code) {
                defaultLanguage = {
                    'value': lang._id,
                    'label': lang.name
                }
                break;
            }
        }
        return defaultLanguage;
    }

    handleEditClose = (questionId)=>{
        this.props.questionsData.map(question => {
            if(questionId == question._id){
                this._questionLang[question._id] = question.transcribeLanguage;
            }
            
        });
    }
    componentDidMount() {
        this._questionLang = {};
        this.props.questionsData.map(question => {
            this._questionLang[question._id] = question.transcribeLanguage;
        });
    }
    render(){
        return (
          <div>
            <table className={this.state.addStatus? "questions-table table-with-add-question" : "questions-table"}>
                {
                    this.props.questionsData.length > 0 &&
                    <thead>
                    <tr>
                        <th>Q#</th>
                        <th>Question Copy</th>
                        <th>Content</th>
                        <th>Response Options</th>
                        <th className="no-print">Edit&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Duplicate</th>
                        <th className="no-print">Move</th>
                    </tr>
                    </thead>
                }
                
                <tbody>
                    {
                        this.props.questionsData.length > 0 
                        ? this.props.questionsData.map((item,index)=>{
                          return  <Question key={item._id}
                                    questionData={item}
                                    groupsdata={this.props.groupsdata}
                                    saveQuestionHandler={this.props.saveQuestionHandler}
                                    topicId={this.props.topicId}
                                    topicSequence={this.props.topicSequence}
                                    questionSequence={item.qSequence}
                                    onDelete={this.deleteButtonClick}
                                    rowType={item.rowType}
                                    topicIndex = {this.props.topicIndex}
                                    questionIndex = {index}
                                    nextQuestionId = {this.props.nextQuestionId}
                                    copyQuestionToHandler={this.props.copyQuestionToHandler}
                                    deleteMedia={this.props.deleteMedia}
                                    moveClickHandler = {(direction) => this.props.moveClickHandler(index, direction)}
                                    selectedTranscribeLanguage={this._questionLang ? this._questionLang[item._id]: this.props.studyTranscribeLanguage}
                                    studyTranscribeLanguage = {this.props.studyTranscribeLanguage}
                                    editClose={this.handleEditClose}
                                    showTranscribePopup={this.handleOpenTranscribePopup}>
                                  </Question>
                            })
                        : <tr><td colSpan="4" className="text-left">No questions have been added to this topic.</td></tr>
                    }
                     
                     {
                         <AddQuestion
                            topicId={this.props.topicId}
                            nextQuestionId = {this.state.nextQuestionTag}
                            selectedTranscribeLanguage={this._addQuestionTranscribe ? this._addQuestionTranscribe.value : this._addQuestionTranscribe}
                            studyTranscribeLanguage = {this.props.studyTranscribeLanguage}
                            saveQuestionHandler = {this.props.saveQuestionHandler}
                            showTranscribePopup={this.handleOpenTranscribePopup}
                            onAddQuestionClose={this.handleAddQuestionClose}>
                        </AddQuestion>
                     }
                </tbody>
            </table>
            <div>
                {
                   !this.state.nextQuestionTag
                   && <button className="button space-right button-add-question" 
                        onClick={this.handleAddQuestionClick}>
                                Add Question
                    </button>
                }
            </div>
          
            <div>
                <DialogModal className="delete-modal" showModal={this.state.showDeletePopup} modalCloseHandler={this.closeDeletePopup} >
                    <div className="modal-header"><h3>Deleting A Question</h3></div>
                    <div className="modal-body">
                        <p>Deleting a question is permanent and cannot be undone! <br/>This question and all associated participant responses will be lost. Are you sure?</p>
                    </div>
                    <div className="modal-footer text-right">
                        <div className="button-group">
                            <button className="button" onClick={this.closeDeletePopup}>Cancel</button>
                            <button className="button remove" onClick={this.onQuestioncDelete}>Remove</button>
                        </div>
                    </div>
                </DialogModal>
            </div>
                {
                    this.renderTranscribeLanguagesModal()
                }
          </div>
        
        );
    }
}

export default Questions;