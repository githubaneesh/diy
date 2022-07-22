import GroupService from "../../../../../services/groupservice";
import Utility from "../../../../../utility/Utility";
import TopicService from "../../../../../services/topicservice";
import QuestionaireService from "../../../../../services/questionaireService";
import NotifierService from "../../../../../services/notifierService";
// import Messages from "../../../../utility/Messages";
import StudyService from '../../../../../services/studyService';
import { Messages } from "../../../../../utility/Messages";

const _groupService = GroupService.instance;
const _topicService = TopicService.instance;
const _questionaireService = QuestionaireService.instance;
const _studyService = StudyService.instance;
const _notifierService = NotifierService.instance;

let _owner;
class DesignTopicsController {
    _studyGroups = [];
    _topics = [];
    _selectedGroup;
    _selectedTopic;
    _transcribeLanguage = null;
    constructor(owner) {
        _owner = owner;
    }

    set StudyGroups(groups) {
        this._studyGroups = groups;
    }

    get StudyGroups() {
        return this._studyGroups || [];
    }

    get StudyTopics() {
        return this._topics || []
    }

    set StudyTopics(val) {
        this._topics = val;
    }

    get GroupOptions() {
        return Utility.convertToDisplayInDropDown(this.StudyGroups);
    }

    set SelectedGroup(group) {
        this._selectedGroup = group;
    }

    get SelectedGroup() {
        return this._selectedGroup;
    }

    set SelectedTopic(topic) {
        this._selectedTopic = topic;
    }

    get SelectedTopic() {
        return this._selectedTopic;
    }

    set TranscribeLanguage(language) {
        this._transcribeLanguage = language;
    }

    get TranscribeLanguage() {
        return this._transcribeLanguage;
    }

    async getStudyDetails(id) {
        const response = await _studyService.getStudyDetails(id);
        return response.body;
    }

    async getStudyName(id) {
        const response = await _studyService.getStudyName(id);
        if (!response || response.error) {
            return
        }
        this.TranscribeLanguage = response.body.transcribeLanguage;
        return response.body.name;
    }
    async fetchStudyGroups(study) {
        const response = await _groupService.getStudyGroups(study);
        _notifierService.showMessage(response);
        if(response && response.body){
            this.StudyGroups = response.body;
        }
        
    }

    async fetchGroupTopics(studyId, groupId) {
        const responce = await _groupService.getGroupTopics(studyId, groupId);
        _notifierService.showMessage(responce);
        if (!responce.error) {
            const topics = responce.body.topics;
            const questionnaire = responce.body.questionnaire;
            const sequence = responce.body.sequence;
            const prerequisite = responce.body.prerequisite;
            const postCounts = responce.body.topicPostsCount?responce.body.topicPostsCount:[];
            const questionaireMap = {};
            const sequenceMap = {};
            const seqMap = {};
            const topicSeqMap = {};
            const prerequisiteMap = {};
            const topicPostsCountMap = {};

            prerequisite.forEach((pre) => {
                prerequisiteMap[pre.topic] = pre;
            });

            sequence.forEach((seq) => {
                sequenceMap[seq.topic + "" + seq.questionnaire] = seq.seqTopic + "" + seq.seqQn;
                seqMap[seq.topic + "" + seq.questionnaire] = seq;
                if (!topicSeqMap[seq.topic]) {
                    topicSeqMap[seq.topic] = seq.seqTopic;
                }
            });

            questionnaire.forEach((question) => {
                if (!questionaireMap[question.topic]) {
                    questionaireMap[question.topic] = [];
                }
                const seq = sequenceMap[question.topic + "" + question._id];
                const qSeq = seqMap[question.topic + "" + question._id];
                question["uiTag"] = seq;
                question["qSequence"] = qSeq["seqQn"];
                question["oldQSequence"] = qSeq["seqQn"];
                question["oldUiTag"] = seq;
                questionaireMap[question.topic].push(question);
            });
            postCounts.forEach((post) => {
                if (!topicPostsCountMap[post._id]) {
                    topicPostsCountMap[post._id] = post.count;
                }
            })


            topics.forEach(topic => {
                topic["questionnaire"] = questionaireMap[topic._id] ? questionaireMap[topic._id].sort((a, b) => a.uiTag < b.uiTag ? -1 : a.uiTag > b.uiTag ? 1 : 0) : [];
                topic["prerequisite"] = prerequisiteMap[topic._id];
                topic["sequence"] = topicSeqMap[topic._id];
                topic["postsCount"] = topicPostsCountMap[topic._id];
            });
            this._topics = topics.sort((a, b) => a.sequence < b.sequence ? -1 : a.sequence > b.sequence ? 1 : 0)
            console.log(this._topics);
        }

    }

    async updateStudyInstructions(content, group) {
        const requestBody = { introduction: content };
        const response = await _groupService.updateGroup(group, requestBody);
        _notifierService.showMessage(response, Messages.group_instructions_update);
        if (response && response.body) {
            this.StudyGroups = this.StudyGroups.map((item) => {
                if (item._id + "" == response.body._id + "") {
                    item.introduction = response.body.introduction;
                }
                return item;
            })
            _owner.setState({
                textValue: content
            });
        }
    }

    async copyStudyInstructionToGroup(currentGroup, toGroup) {
        const response = await _groupService.copyInstrunctionsToGroup({
            "source": currentGroup,
            "destination": toGroup
        });

        console.log("copied...", response);

        _notifierService.showMessage(response, Messages.group_instructions_copy);
        if (response && !response.error) {
            this.StudyGroups = this.StudyGroups.map((item) => {
                if (toGroup.indexOf(item._id) != -1) {
                    item["introduction"] = this._selectedGroup.introduction;
                }
                return item;
            });
        }
    }

    //this method is currently not being used
    async copyQuestionToGroup(currentGroup, toGroup, question) {
        const response = await _groupService.copyInstrunctionsToGroup({
            "source": currentGroup,
            "question": question,
            "destination": toGroup
        });
        console.log("copied...", response);
    }

    async saveQuestion(oldQuestion, topicId, updatedQuestion, responces, tag, file, extras={}) {
        let response;
        let requestBody;
        if (oldQuestion) {
            // edit question call goes here
            requestBody = {
                task: updatedQuestion,
                responses: responces,
                // media: "https://looklook-app.s3-accelerate.amazonaws.com/IMG_djzewe_1574064071477.jpg"
            }
            if (file) {
                requestBody["media"] = file;
            }
            // set transcribeLanguage if present in extras
            if (extras.transcribeLanguage) {
                requestBody["transcribeLanguage"] = extras.transcribeLanguage;
            }
            console.log("requestBody", requestBody);
            response = await _questionaireService.updateQuestion(oldQuestion._id, requestBody);
            _notifierService.showMessage(response, Messages.question_update);

        } else {
            // add new question
            requestBody = {
                task: updatedQuestion,
                tag: tag,
                topic: topicId,
                group: [this.SelectedGroup._id],
                responses: responces,
            }
            if (file) {
                requestBody["media"] = file;
            }
            // set transcribeLanguage if present in extras
            if (extras.transcribeLanguage) {
                requestBody["transcribeLanguage"] = extras.transcribeLanguage;
            }
            response = await _questionaireService.addQuestion(requestBody);
            _notifierService.showMessage(response, Messages.question_add);

        }

        return response;
    }

    async addTopic(data) {
        const requestBody = {
            title: data.topicName,
            groups: [this.SelectedGroup._id],
            study: this.SelectedGroup.study,
            instructions: data.topicInstructions,
            isEnable: data.enabled,
            untilEnable: data.untilEnable,
            prerequisite: data.selectedTopics
        }
        const response = await _topicService.addTopic(requestBody);
        _notifierService.showMessage(response, Messages.topic_add);
        return response;
    }

    async showLastAddedTopic(studyId, groupId){
        await this.fetchGroupTopics(studyId, groupId);
        let lastAddedTopicIndex = this._topics.length -1;
        this._topics[lastAddedTopicIndex].editActive = false;
        this._topics[lastAddedTopicIndex].active = true;
        const allowedTopics = this.lockTopicsData(this._topics[lastAddedTopicIndex]);
        let Prequisites = this.selectedPrequisitesData(this._topics[lastAddedTopicIndex], allowedTopics) ;
        this._topics[lastAddedTopicIndex].allowedTopics = allowedTopics;
        this._topics[lastAddedTopicIndex].prequisitesData = Prequisites;
    }

    async copyTopicToGroup(currentGroup, toGroup, editTopicId) {
        const response = await _topicService.copyTopicToGroup({
            "topic": editTopicId,
            "source": currentGroup,
            "destination": toGroup
        });
        _notifierService.showMessage(response, Messages.topic_copy);
        if(response && response.body) {
            if(currentGroup === toGroup) {
                // fetch all updated topics again
                await this.fetchGroupTopics(this.SelectedGroup.study, this.SelectedGroup._id);
                //  select the current editing topic
                let selectedTopicIndex = this._topics.findIndex(t=> t._id == editTopicId);
                if(selectedTopicIndex !== -1) {
                    this._topics[selectedTopicIndex].editActive = true;
                    this._topics[selectedTopicIndex].active = true;
                    const allowedTopics = this.lockTopicsData(this._topics[selectedTopicIndex]);
                    let Prequisites = this.selectedPrequisitesData(this._topics[selectedTopicIndex], allowedTopics) ;
                    this._topics[selectedTopicIndex].allowedTopics = allowedTopics;
                    this._topics[selectedTopicIndex].prequisitesData = Prequisites;
                }
            }
        }
    }
    
    async updateTopic(requestBody) {
            const response = await _topicService.updateTopic(requestBody, requestBody._id)
        _notifierService.showMessage(response, Messages.topic_update);
        return response;
    }

    async updatePrerequisite(prerequisiteArray, topic, group, studyId) {

        const requestBody = {
            prerequisite: prerequisiteArray,
            study: studyId
        }

        const response = await _topicService.updatePrerequisite(requestBody, topic, group);
        console.log(`updatePrerequisite prerequisiteArray : ${prerequisiteArray} topic : ${topic} group : ${group}  response : `, response);
        _notifierService.showMessage(response, Messages.topic_prerequisite_update);
        return response;
    }

    async topicReorder(data) {
        const requestBody = {
            from: data.from,
            to: data.to,
            group: data.group,
            direction: data.direction
        }

        const response = await _topicService.topicReorder(requestBody);
        _notifierService.showMessage(response, Messages.topic_update);
        return response;
    }

    async updateQuestionsOrder(reorderedQuestionsList, topicId) {

        const postContent = {
            group: this.SelectedGroup._id,
            topic: topicId,
            sequence: reorderedQuestionsList
        }
        const response = await _questionaireService.updateQuestionsOrder(postContent);
        _notifierService.showMessage(response, Messages.question_moved);
        return response;
    }

    async topicsForQuestionCopy(studyId, groupId) {
        const response = await _questionaireService.topicsForQuestionCopy(studyId, groupId);
        _notifierService.showMessage(response);
        return response;
    }

    async copyQuestionToTopic(groupId, topicId, questionnId) {
        const postContent = {
            group: groupId,
            topic: topicId,
            questionnaire: questionnId
        }

        const response = await _questionaireService.copyQuestionToTopic(postContent);
        _notifierService.showMessage(response, Messages.question_copy);
        return response;
    }

    async moveTopicHandler(topicCurrentIndex, direction) {
        const otherTopicIndex = direction == "up" ? topicCurrentIndex - 1 : topicCurrentIndex + 1;
        const requestBody = {
            from: this.StudyTopics[topicCurrentIndex]._id,
            to: this.StudyTopics[otherTopicIndex]._id,
            group: this.SelectedGroup._id,
            direction: direction
        }
        const response = await _topicService.topicReorder(requestBody);
        if (response.error) {
            return;
        }
        const temp = this.setObjectValuesByDirection(this.StudyTopics[topicCurrentIndex], "sequence", direction == "up");
        this.StudyTopics[topicCurrentIndex] = this.setObjectValuesByDirection(this.StudyTopics[otherTopicIndex], "sequence", direction != "up");
        this.StudyTopics[otherTopicIndex] = temp;
        _owner.setState({ dataMoved: true, editTopic: false });
    }

    setObjectValuesByDirection(obj, key, decrease) {
        if (obj[key]) {
            if (decrease) {
                obj[key] = obj[key] - 1;
            } else {
                obj[key] = obj[key] + 1;
            }
        }
        return obj;
    }

    newTopicAllowedLockTopics() {
        return Utility.convertTopicsToDisplayInDropDown(this.StudyTopics);
    }

    lockTopicsData(topic) {
        const dependencyGraph = {};
        const topicsAllowed = [];
        for (let sTopic of this.StudyTopics) {
            dependencyGraph[sTopic._id + ""] = [];
            if (sTopic.prerequisite && sTopic.prerequisite.prerequisite) {
                dependencyGraph[sTopic._id + ""] = sTopic.prerequisite.prerequisite;
            }
        }
        for (let sTopic of this.StudyTopics) {
            if (topic._id + "" != sTopic._id + "" && dependencyGraph[sTopic._id + ""].indexOf(topic._id + "") == -1) {
                const isDependent = this.checkInDependencyGraph(dependencyGraph, topic._id, sTopic._id);
                if (!isDependent) {
                    topicsAllowed.push(sTopic);
                }
            }
        }
        return Utility.convertTopicsToDisplayInDropDown(topicsAllowed);
    }

    checkInDependencyGraph(dependencies, current, prerequisite) {
        let flag = true;
        let tempCurrent = prerequisite;
        while (flag) {
            const currentDependents = dependencies[tempCurrent + ""];
            if (!currentDependents || (currentDependents && currentDependents.length === 0)) {
                return false;
            }
            if (currentDependents && currentDependents.indexOf(current + "") !== -1) {
                return true;
            }
            tempCurrent = currentDependents[0] + "";
        }
    }

    selectedPrequisitesData(topic, allowedTopics) {
        let prequisites;
        if (topic.prerequisite) {
            topic.prerequisite.prerequisite.forEach((e) => {
                let filteredPrerequisite = allowedTopics.filter((t) => t.value === e)
                if(filteredPrerequisite && filteredPrerequisite.length > 0) {
                    let label = allowedTopics.filter((t) => t.value === e)[0].label;
                    let prequisite = { value: e, label: label };
                    prequisites = prequisites === undefined ? [] : prequisites;
                    prequisites.push(prequisite)
                }
            })
        }

        return prequisites;
    }

    compareObjectKeys(data, key, keyToValidate) {
        for (let d of data) {
            if (d[key] != d[keyToValidate]) { return true; }
        }
        return false;
    }

    moveQuestionHandler(topicIndex, questionIndex, direction) {
        const currentTopic = this.StudyTopics[topicIndex];
        if (currentTopic && currentTopic.questionnaire && currentTopic.questionnaire.length > 0) {
            const otherQuestionIndex = questionIndex + (direction == "up" ? -1 : 1);
            const currentQuestion = currentTopic.questionnaire[questionIndex];
            const otherQuestion = currentTopic.questionnaire[otherQuestionIndex];
            const tempSeq = currentQuestion["qSequence"];
            currentQuestion["qSequence"] = otherQuestion["qSequence"];
            otherQuestion["qSequence"] = tempSeq;
            currentTopic.questionnaire[questionIndex] = otherQuestion;
            currentTopic.questionnaire[otherQuestionIndex] = currentQuestion;
            this.StudyTopics[topicIndex] = currentTopic;

            this.saveReorderedQuestions(topicIndex);
            _owner.setState({ dataMoved: true })
        }
    }

    async saveReorderedQuestions(topicIndex) {
        const topic = this.StudyTopics[topicIndex];
        if (topic && topic.questionnaire && topic.questionnaire.length > 0) {
            const questionSeqs = [];
            for (let question of topic.questionnaire) {
                if (question["qSequence"] != question["oldQSequence"]) {
                    questionSeqs.push({ questionnaire: question._id, tag: question["qSequence"] });
                }
            }
            if (questionSeqs.length > 0) {
                const response = await this.updateQuestionsOrder(questionSeqs, topic._id);
                if (response.error) { return; }
                topic["questionnaire"] = topic["questionnaire"].map(item => {
                    item["oldQSequence"] = item["qSequence"];
                    return item;
                })
            }
        }
    }

    async deleteQuestion(questionId, questionGroup, questionData){
        
        const response = await _questionaireService.deleteQuestion(questionId, questionGroup);
        _notifierService.showMessage(response);
        if(!response.error && response.body){
            let topicIndex = this.StudyTopics.findIndex((t)=>t._id === questionData.topic);
            let topic = this.StudyTopics[topicIndex];
            topic.questionnaire.forEach((ques, index) => {
                if (ques._id === questionData._id) {
                topic.questionnaire.splice(index,1);
                }
            });
            topic.questionnaire.forEach((ques, index) => {
                ques["qSequence"] = String.fromCharCode(96 + (index+1));
            });

            Object.assign(this.StudyTopics[topicIndex], topic);
        }
        return response;
    }

}
export default DesignTopicsController;