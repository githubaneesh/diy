import React, { Component } from 'react';
import './style.scss';
import PrintPostCard from './print-post-card';
import RoutesUtility from '../../../utility/routesutility';
import ParticipantService from '../../../services/participantService';
import CommentService from '../../../services/commentService';
import StudyService from '../../../services/studyService';
import CookieService from '../../../services/cookieservice';
import UserType from '../../../common/userType';
import { Messages } from '../../../utility/Messages';
import NotifierService from '../../../services/notifierService';
import Event from '../../../services/events/event';
import QuestionaireService from '../../../services/questionaireService';

const _participantService = ParticipantService.instance;
const _commentService = CommentService.instance;
const _studyService = StudyService.instance;
const _notifierService = NotifierService.instance;
const _questionaireService = QuestionaireService.instance;

class PrintParticipantsPost extends Component {
    _cookieService = CookieService.instance;
    _participantId = "";
    postDetails = [];
    studyDetails;
    user;
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isTranslating: true
        }
        this.user = this._cookieService.user;
        this._participantId = this.props.participantId;
    }

    async getStudyDetails(id) {
        const response = await _studyService.getStudyDetails(id);
        return response.body;
    }

    async isStudyAssingedToMe(studyId) {
        const _userType = this.user.userType.toLowerCase();
        // const resp = await this._study.fetchAssignedStudies("unarchived");
        const resp = await _studyService.fetchStudies({type: "unarchived"});
        const studyIds = resp?resp.body.map(study=> study._id) : [];
        return studyIds.includes(studyId);

    }

    logout() {
        this._cookieService.clearAll();
        CookieService.dispatchEvent(new Event(this._cookieService.USER_LOGIN_STATUS, "user logged out."));
        this.props.history.push(RoutesUtility.LOGIN());
        _notifierService.showMessage({error:true}, '', Messages.authentication_failed);
    }

    async componentDidMount() {
        const participantDetails = await _participantService.getParticipantDetails(this.props.participantId);

        if(this.user.userType.toLowerCase() !== UserType.ADMIN) {
            const isStudyAssinged = await this.isStudyAssingedToMe(participantDetails.data.study._id);
            if(!isStudyAssinged) {
                this.logout();
            }
        }

        this.studyDetails = await this.getStudyDetails(participantDetails.data.study._id);

        if (this._participantId) {
            const questionnaireResponse = await _questionaireService.getQuestionnaireByGroup(participantDetails.data.study._id, participantDetails.data.group._id);
            const newQuestionnaire = questionnaireResponse.body ? questionnaireResponse.body : [];
            const response = await _participantService.getParticipantPostComment(participantDetails.data.study._id, this._participantId);
            if (response && !response.error) {
                this.postDetails = [];
                
                for(let [index, post] of response.body.slice(0).entries()) {
                    for(let j=0; j<newQuestionnaire.length; j++) {
                        if(newQuestionnaire[j] && newQuestionnaire[j].hasOwnProperty("attachment")
                            && newQuestionnaire[j].attachment.length
                            && post.questionnaire._id === newQuestionnaire[j]._id) {
                                newQuestionnaire[j].attachment.forEach(function (element) {
                                    element.isQuestionMedia = true;
                                });
                                post["questionMedia"] = newQuestionnaire[j].attachment;
                                newQuestionnaire.splice(j, 1);
                                --j;
                        }
                    }
                    post = this.validatePostMedia(post, index);
                    post["comments"] =  post.comments? post.comments.sort((a, b) => { return new Date(a["createdAt"]) - new Date(b["createdAt"]) }): [];
                    post["tag"] = post.sequence ? (post.sequence.seqTopic+""+post.sequence.seqQn) : index;
                    this.postDetails.push(post);
                }

                const questionnaireWithMedia = newQuestionnaire.filter(item => item.hasOwnProperty("attachment") && item.attachment.length);
                for (let k = 0; k < questionnaireWithMedia.length; k++) {
                    questionnaireWithMedia[k].attachment.forEach(function (element) {
                        element.isQuestionMedia = true;
                    });
                    if (questionnaireWithMedia[k].sequence) {
                        this.postDetails.push({
                            "tag": `${questionnaireWithMedia[k].sequence.seqTopic}${questionnaireWithMedia[k].sequence.seqQn}`,
                            "questionnaire": { "task": questionnaireWithMedia[k].task, "_id": questionnaireWithMedia[k]._id },
                            "questionMedia": questionnaireWithMedia[k].attachment,
                            "topic": questionnaireWithMedia[k].topic,
                            "user": participantDetails.data.user,
                            "media": questionnaireWithMedia[k].attachment
                        });
                    }
                }
                if(this.studyDetails["isNewStudy"]) {
                    this.postDetails = this.postDetails.sort((a, b) => a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0);
                }
                
                this.setState({isLoading: false});
                this.postDetails = await this.fetchLocaleComments(this.postDetails.slice(0));
                this.setState({isTranslating: false});
                
            }
            else {
                this.setState({isLoading: false, isTranslating: false});
            }
        }
    }

    onCloseClicked=()=> {
        this.props.history.push(RoutesUtility.PARTICIPANT_PROFILE(this.props.participantId));
    }

    onPrintClicked=()=> {
        window.print();
    }

    validatePostMedia(post, count) {
        const postMedia =  post ? Object.assign({}, post) : null;
        if(post && !post.media && post.imageUrl) {
            postMedia["media"] = [{_id:`${post._id}-${count}`, image:post.imageUrl}];
        }
        if(postMedia["questionMedia"]) {
            if(!postMedia["media"]) {
                postMedia["media"] = postMedia["questionMedia"]
            }
            else {
                postMedia["media"].unshift(...postMedia["questionMedia"])
            }
           
        }
        return postMedia
    }

    async fetchLocaleComments(postsResponse) {
        const postsWithLocalComments = [];
        for(let post of postsResponse) {
            const postComments = post.comments ? post.comments : [];
            if (postComments.length > 0) {
                let commentIds = postComments.map(c => c._id);
                let postContent = { "Ids": commentIds };
                let localeComments = await _commentService.getLocaleComments(postContent);

                if (localeComments && localeComments.body && localeComments.body.length > 0) {
                    for (let comment of postComments) {
                        let localeComment = localeComments.body.find(c => c.comment == comment._id);
                        if (localeComment) {
                            comment["localeComment"] = localeComment.text ? localeComment.text : "";
                        }
                    }
                    
                }
            }
            postsWithLocalComments.push(post)
        }
        return postsWithLocalComments;
    }

    render() {
        return (
            <div className="print-participants-post">
                <div className="actions-container no-print">
                    <div className="action-container-inner">
                        <button 
                            className={(this.state.isLoading || this.state.isTranslating) ? "button loading-button" : "button"} 
                            onClick={this.onPrintClicked}>
                                {this.state.isLoading ? "Loading..." : "Print"}
                        </button>
                        <button className="button" onClick={this.onCloseClicked}>Close</button>
                    </div>
                </div>

                <div className="print-content">
                    {
                        this.postDetails.map((postDetail, index) => (
                            <PrintPostCard 
                                key={postDetail._id || index }
                                media={postDetail.media}
                                comments={postDetail.comments}
                                user={postDetail.user}
                            />
                        ))
                    }
                </div>

            </div>
        );
    }
}

export default PrintParticipantsPost;