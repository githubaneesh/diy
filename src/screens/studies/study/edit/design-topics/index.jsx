import React, { Component } from 'react';
import './style.scss';
import Accordian from '../../../../widgets/accordian';
import Tab from '../../../../widgets/accordian/tab';
import Questions from './components/questions';
import AutoSaveTextArea from "../../../../widgets/auto-save-textarea";
import DesignTopicController from "./designtopics";
import Dropdown from '../../../../widgets/dropdown/index';
import Utility from '../../../../../utility/Utility';
import EditTopicPanel from './components/edit-topic-panel';
import { FaPrint, FaListAlt} from "react-icons/fa";
import { Link } from 'react-router-dom';
import Loader from '../../../../widgets/loader';
import DialogModal from '../../../../widgets/dialog-modal/index';
import RoutesUtility from "../../../../../utility/routesutility";
import Group from './components/group/index';
import AddTopicPanel from './components/add-topic-panel/index';
import NotifierService from '../../../../../services/notifierService';
import { Messages } from '../../../../../utility/Messages';
import CookieService from '../../../../../services/cookieservice';
import UserType from '../../../../../common/userType';
import Event from '../../../../../services/events/event';
import OrganizationService from '../../../../../services/organizationservice';

class DesignTopics extends Component {
    _cookieService = CookieService.instance;
    _notifierService = NotifierService.instance;
    _organizationService = OrganizationService.instance;
    _controller;
    topicsQuestionCopy = [];
    selectedQuestion = '';
    selectedGroupId = '';
    studyId = '';
    studyName = '';
    user;

    constructor() {
        super();
        this.state = {
            tabShow: false,
            isEdit: false,
            textValue: "",
            responseSelected: false,
            dataMoved: false,
            viewAll: false,
            editTopic: false,
            showDialog: false,
            refresh: false,
            toggleCopyToInstructionDropDown: false
        }

        this.user = this._cookieService.user;
        this._controller = new DesignTopicController(this);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.handleViewAll = this.handleViewAll.bind(this);
        this.onTopicEditClickHandler = this.onTopicEditClickHandler.bind(this);
        this.handleGroupTabClick = this.handleGroupTabClick.bind(this);
        this.handlePrint = this.handlePrint.bind(this);
    }

    logout() {
      this._cookieService.clearAll();
      CookieService.dispatchEvent(new Event(this._cookieService.USER_LOGIN_STATUS, "user logged out."));
      this.props.history.push(RoutesUtility.LOGIN());
      this._notifierService.showMessage({error:true}, '', Messages.authentication_failed);
    }

    async componentDidMount () {
      const { params } = this.props.match;
      this.studyId = params.study;

      if(this.user.userType.toLowerCase() !== UserType.ADMIN) {
        if(this.user.userType.toLowerCase() === UserType.MODERATOR || this.user.userType.toLowerCase() === UserType.CLIENT) {
            this.logout();
        }
        else if(this.user.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR) {
            const response = await this._controller.getStudyDetails(this.props.studyId);
            const isOutOfOrganization = await this.isStudyOutsideOfOrganization(response);
            if(isOutOfOrganization) {
                this.logout();
            }
        }
    }

      this.studyName = await this._controller.getStudyName(this.studyId);
      await this._controller.fetchStudyGroups(this.studyId);
      if (this._controller.StudyGroups && this._controller.StudyGroups.length > 0) {
        if (params && params.group) {
          const selectedGroup = this._controller.StudyGroups.find(i=>i._id+""==params.group+"");
          if (selectedGroup) {
            this.groupChangeHandler(selectedGroup);
          } else {
            this.props.history.push("/");
          }
        } else {
          this.groupChangeHandler(this._controller.StudyGroups[0]);
        }
      }
      // this.setState({isEdit: true});
  }

  async isStudyOutsideOfOrganization(studyDetails) {
    const _userType = this.user.userType.toLowerCase();
    const _orgId = studyDetails.client._id;
    const resp = await this._organizationService.getOrganizations();
    const organizationIds = resp?resp.body.map(org=> org._id) : [];
    return !organizationIds.includes(_orgId);
}

  refreshUI () {
    this.setState({
      refresh: !this.state.refresh,
    })
  }


  handleTabClick(id) {
    const topics = this._controller.StudyTopics.map((topic) => {
      if (topic._id+"" == id+"") {
        topic.active = !topic.active;
        this._controller.SelectedTopic = topic;
      } else if(!this.state.viewAll) {
        topic.active = false;
      }
      return topic;
    });
    this._controller.StudyTopics = topics;
    this.refreshUI()
  }

  handleViewAll() {
    this._controller.StudyTopics.forEach((topic) => {
      topic.active = !this.state.viewAll;
    })
    // this.setState({viewAll: !this.state.viewAll})
    this.setState({viewAll: !this.state.viewAll});
  }

  copyInstructionTo = async(group) => {
    const groupList = group.value === 'all' ? this.otherGroupsData.map(function(item) { return item.value; }) : [group.value];
    await this._controller.copyStudyInstructionToGroup(this._controller.SelectedGroup._id, groupList);
  }

  copyQuestionTo = async(toGroup, question) => {

    this.selectedQuestion = question._id;
    this.selectedGroupId = toGroup.value;
    const response = await this._controller.topicsForQuestionCopy(this.studyId, this.selectedGroupId);
    
    if(response.body){
      this.topicsQuestionCopy = Utility.convertTopicsToDisplayInDropDown(response.body);
      this.setState({showDialog: true});
    }
    // await this._controller.copyStudyInstructionToGroup(this._controller.SelectedGroup._id, toGroup.value, question);
  }
  
  get otherGroupsData () {
    return this._controller.GroupOptions.filter(i=>i.value !== this._controller.SelectedGroup._id);
  }

  saveQuestion = async(oldQuestion, topicId, updatedQuestion, responces, tag, file, extras = {}) => {
    const response = await this._controller.saveQuestion(oldQuestion, topicId, updatedQuestion, responces, tag, file, extras);
      if(response){
        let newQuestion;
        if(oldQuestion) {
          newQuestion = response.body;
          this.updateQuestion(newQuestion, oldQuestion, file);
        }
        else {
          if(!response.error){
            newQuestion = response.body;
            this.addQuestion(newQuestion);
          }
        }
      }
  }

  updateQuestion = (updatedQuestion, oldQuestion, file) => {

    let topicIndex = this._controller.StudyTopics.findIndex((t)=>t._id === updatedQuestion.topic);

    let topic = this._controller.StudyTopics[topicIndex];

    topic.questionnaire.some(ques => {
      if (ques._id === oldQuestion._id) {
        ques.task = updatedQuestion.task;
        ques.responses = updatedQuestion.responses;
        if (file) {
          ques.attachment = updatedQuestion.attachment;
        }
        if (updatedQuestion.transcribeLanguage) {
          ques['transcribeLanguage'] = updatedQuestion.transcribeLanguage
        }
        return true;
      }
    });

    Object.assign(this._controller.StudyTopics[topicIndex], topic);
  };

  deleteQuestion = async(questionId, questionGroup, questionData) => {
     
    const response = await this._controller.deleteQuestion(questionId, questionGroup, questionData);
    if(!response.error) {
      this.setState({isEdit: !this.state.isEdit});
      this._notifierService.showMessage(response, Messages.question_delete);
    }
      
    return response;
  };

  addQuestion = (newQuestion)=>{
    newQuestion.uiTag = newQuestion.tag;
    newQuestion.qSequence = newQuestion.sequence && newQuestion.sequence.seqQn ? newQuestion.sequence.seqQn : newQuestion.tag[newQuestion.tag.length-1];
    this._controller.StudyTopics.filter((item)=> item._id === newQuestion.topic)[0].questionnaire.push(newQuestion);
  }

  addTopic = async(data)=> {
    const response = await this._controller.addTopic(data);
    if(!response.error){
      this.groupChangeHandler(this._controller.SelectedGroup);
      await this._controller.showLastAddedTopic(this.studyId, this._controller.SelectedGroup._id);
      this.setState({isEdit: !this.state.isEdit});
    } 
  }

  deleteTopic = async(topicData) => {
    await this._controller.fetchGroupTopics(this.studyId, this._controller.SelectedGroup._id);
    this.setState({isEdit: !this.state.isEdit});
  }
 
  groupChangeHandler = async(group, openTab) =>  {
    this._controller.SelectedGroup = this._controller.StudyGroups.find(i=>i._id == group._id);
    this.setState({
      isFetching: true,
      activeTab: -1,
      viewAll: false
    }, async () => {
      this.props.disablePrint(this.state.isFetching)
      await this._controller.fetchGroupTopics(this.studyId, group._id);
      if(openTab) {
        this.handleTabClick(this._controller.SelectedTopic._id);
      }
      
      this.setState({
        isFetching: false
      }, ()=>{
        this.props.disablePrint(this.state.isFetching)
      })
    })
    this.setState({textValue: (this._controller.SelectedGroup.introduction || "")});
  }
  responseSelectHandler(topicId, questionId, responseType) {
    this._controller.StudyTopics.map(item => {
      if (item._id === topicId) {
        item.questionnaire.map(question => {
          if (question._id === questionId) {
            question.responses[responseType] = question.responses[responseType] === 0 ? 1 : 0;
            this.setState({
              responseSelected: !this.state.responseSelected
            });
          }
        });
      }
    });
  }

  copyTopicHandler = async(group, editTopicId)=> {
    await this._controller.copyTopicToGroup(this._controller.SelectedGroup._id, group.value, editTopicId);
    this.refreshUI();
  }
   
  saveUpdatedTopic = async(updatedTopicData) => {
    const response = await this._controller.updateTopic(updatedTopicData);
    if(response && !response.error){
      let index = this._controller.StudyTopics.findIndex(topic => topic._id === response.body._id);
      this._controller.StudyTopics[index].title = response.body.title;
      this._controller.StudyTopics[index].instructions = response.body.instructions;
      this._controller.StudyTopics[index].isEnable = response.body.isEnable;
      this._controller.StudyTopics[index].untilEnable = response.body.untilEnable;
      this.setState({editTopic: false});
    }
  }

  saveUpdatedPrequisites = async(updatedTopicData) => {
    const response = await this._controller.updatePrerequisite(updatedTopicData.prerequisites, updatedTopicData._id, updatedTopicData.selectedGroupId, this.studyId);
    if(!response.error){
      let index = this._controller.StudyTopics.findIndex(topic => topic._id === updatedTopicData._id);
      this._controller.StudyTopics[index].prerequisite = response.body;
      this.setState({editTopic: false});
    }
  }

    onTopicEditClickHandler(topicId){
      this._controller.StudyTopics.forEach((topic) => {
        topic.editActive = topic._id === topicId ? !topic.editActive : false;
        if(topic.editActive){
            const allowedTopics = this._controller.lockTopicsData(topic);
            let Prequisites = this._controller.selectedPrequisitesData(topic, allowedTopics) ;
            topic["allowedTopics"] = allowedTopics;
            topic.prequisitesData = Prequisites;
        }
      })
      this.setState({
          editTopic: !this.state.editTopic
      })
     
    }

    handlePrint() {
      this._controller.StudyTopics.forEach((topic) => {
        topic.active = true;
      });
      this.setState({viewAll: true}, ()=>{
        window.print();
      });
    }

    closeModal = () => {
      this.setState({showDialog: false});
    }

    handleTopicSelect = (selectedTopic) => {
      if(this.selectedGroupId && this.selectedQuestion){
        this.setState({showDialog: false}, async()=>{
          const response = await this._controller.copyQuestionToTopic(this.selectedGroupId, selectedTopic.value, this.selectedQuestion);
          if(!response.error && this._controller.SelectedGroup._id === this.selectedGroupId) {
            this.groupChangeHandler(this._controller.SelectedGroup, true);
          }
        }); 
      }
    }

    handleMediaDelete = async(GroupId, topicIndex, questionIndex, mediaIndex)=>{
      this._controller.StudyTopics[topicIndex].questionnaire[questionIndex].attachment.splice(mediaIndex, 1);
      this.setState({refresh: !this.state.refresh});
    }

    handleGroupTabClick (group) {
      if (this._controller.SelectedGroup && this._controller.SelectedGroup._id+"" == group._id+"") { return; }
      this.groupChangeHandler(group);
    }
    toggleCopyInstructionToDropdown=(toggle)=> {
        this.setState({toggleCopyToInstructionDropDown: toggle});
    }
  render() {
    return (
      <div id="designTopic" className="design-topics">
        <div className="title-topic">
          <h2 className="study-name">{this.studyName}</h2>
              <button className="button" 
                onClick={this.handleViewAll} disabled={this.state.isFetching}>
                  <FaListAlt/> <span>{this.state.viewAll? 'Collapse All' : 'View All'}</span>
              </button>
              {/* <button className="button space-left" onClick={this.handlePrint} disabled={this.state.isFetching}>
                <FaPrint /> <span>Print</span>
              </button> */}
        </div>
        <div className="groups-tab-container">
          <div className="groups-tab-container-inner">
            {
              this._controller.StudyGroups.map((group, index)=> {
                  return <Link key={`g-route-${index}`} to={{
                    pathname: RoutesUtility.DESIGN_TOPICS(this.studyId, group._id)
                  }} onClick={()=>this.handleGroupTabClick(group)}><div key={index} className={group._id === this._controller.SelectedGroup._id ? "group-tab active" :  "group-tab"} 
                  >
                  {group.name}
                  </div></Link>
              })
            }
          </div>
        </div>
        <div className="group-tab-detail-container">
            <div className="group-details-container">
              <Group groupData={this._controller.SelectedGroup ? this._controller.SelectedGroup : ''}></Group>
            </div>

            <div className="autosave-container">
              <div className="autosave-inner">
                <AutoSaveTextArea
                  collapsible="true"
                  title={this._controller.SelectedGroup ? this._controller.SelectedGroup.name + ' Study Overview ' : ''}
                  multiline={false}
                  rows={5}
                  saveData={(content) => this._controller.updateStudyInstructions(content, this._controller.SelectedGroup._id)}
                  collapeTextEditorHandler={this.toggleCopyInstructionToDropdown}
                  textValue={this.state.textValue}
                  type={"editor"}
                  editorStyle={{width: '100%'}}
                />
              </div>
              <div className={this.state.toggleCopyToInstructionDropDown? "dropdown-container hide" : "dropdown-container"}>
                <Dropdown 
                  defaultOptionText="Copy To Group" 
                  optionsData={[{value:'all', label: 'All groups'}, ...this.otherGroupsData]} 
                  onChangeHandle={this.copyInstructionTo}
                  placeholder={"Copy to..."}>
                </Dropdown>
              </div>
            </div>
            {
              this.state.isFetching ?
              <Loader/>
              :
              <div>
                  <Accordian>
                        {this._controller.StudyTopics.map((tab, index) => {
                          return (
                            <Tab
                              key={index}
                              index={Utility.formatMe(index+1)}
                              id={tab._id}
                              handleclick={() => this.handleTabClick(tab._id)}
                              title={tab.title}
                              active={tab.active}
                              editActive={tab.editActive}
                              editClickHandler = {this.onTopicEditClickHandler}>
                              {
                                (tab.editActive) && <EditTopicPanel
                                                            topicData={tab}                         
                                                            groupsdata={this._controller.GroupOptions}
                                                            lockTopicData={tab.allowedTopics}
                                                            onDelete={this.deleteTopic}
                                                            moveTopicHandler = {(direction) =>this._controller.moveTopicHandler(index, direction)}
                                                            saveUpdatedTopic = {this.saveUpdatedTopic}
                                                            selectedGroup = {this._controller.SelectedGroup}
                                                            prequisitesData = {tab.prequisitesData}
                                                            saveUpdatedPrequisites = {this.saveUpdatedPrequisites}
                                                            copyTopicHandler = {this.copyTopicHandler}>
                                                    </EditTopicPanel>
                              }
                              
                              <Questions
                                  key={`question-${Tab._id}`}
                                  questionsData={tab.questionnaire}
                                  topicIndex = {index}
                                  groupsdata={this._controller.GroupOptions}
                                  copyQuestionToHandler={this.copyQuestionTo}
                                  saveQuestionHandler={this.saveQuestion}
                                  onEditClick={this.onEditClick}
                                  onDelete={this.deleteQuestion}
                                  onEditCloseClick={this.onEditCloseClick}
                                  topicId={tab._id}
                                  topicSequence={tab.sequence || (index + 1)}
                                  studyTranscribeLanguage = {this._controller.TranscribeLanguage}
                                  deleteMedia = {this.handleMediaDelete}
                                  moveClickHandler = {(questionIndex, direction) => this._controller.moveQuestionHandler(index, questionIndex, direction)}>
                              </Questions>
                            </Tab>
                          );
                        })}
                </Accordian>
                <div>
                  <AddTopicPanel 
                    onAddTopicCloseClick={this.onAddTopicCloseClick}
                    groupsdata={this.otherGroupsData}
                    topicsData={this._controller.newTopicAllowedLockTopics()}
                    saveHandler={this.addTopic}>
                  </AddTopicPanel>
                </div>  
              </div>
            }
        </div>
        <div className="clear-fix"></div>
          <DialogModal
              className="copy-modal"
              showModal={this.state.showDialog}
            modalCloseHandler={this.closeModal} >
              <div className="modal-header"></div>
              <div className="modal-body">
                Select Topic : 
                  <Dropdown 
                      defaultOptionText="Copy To Topic" 
                      optionsData={this.topicsQuestionCopy} 
                      onChangeHandle={this.handleTopicSelect}
                      placeholder={"Copy to topic"}>
                  </Dropdown>
              </div>
        </DialogModal>        
      </div>
    );
  }
}

export default DesignTopics;
