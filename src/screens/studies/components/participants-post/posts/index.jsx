import React, { Component } from 'react';
import './style.scss';
import PostCommentEditable from '../post-comment-edit';
import PostCommentTag from '../post-comment-tag/index';
import QuestionaireService from '../../../../../services/questionaireService';
import TagService from '../../../../../services/tagService';
import DialogModal from '../../../../widgets/dialog-modal';
import CookieService from '../../../../../services/cookieservice';
import Utility from '../../../../../utility/Utility';
import UserType from '../../../../../common/userType';

const _cookieService = CookieService.instance;

class Posts extends Component {

    _questionaireService = QuestionaireService.instance;
    _tagService = TagService.instance;
    _owner = this;
    selectedText = '';
    commentId = '';
    left; top; display = 'none';
    commentToDelete;
    _comments = [];
    _studyId = '';
    _studyTags = [];
    _questionTags = [];
    _tagList = {};
    _localeCommentsTagList = {};
    _optionsData = [];
    _commentType = "Comment";

    constructor(props) {
        super(props);
        this.state = {
            deletingComment: false,
            showDeleteCommentModal: false,
            refresh: false,
        }
        this._studyId = this.props.studyId;
        this._comments = this.props.comments;
    }

    refreshUI = () => {
        this.setState({ refresh: !this.state.refresh });
    }

    fetchAllTags = async () => {
        await this.getQuestionTags();
        await this.getStudyTags();
    }

    getTagListForComments = () => {
        this._tagList = {};
        this._localeCommentsTagList = {};
        const tagData = this._questionTags.concat(this._studyTags);
        this._comments.map(comment => {
            this._tagList[comment._id] = [];
                tagData.map(tag => {
                    if (tag.texts) {
                        var texts = [];
                        tag.texts.map(textObj => {
                            if (textObj.comment === comment._id) {
                                texts.push(textObj.text);
                            }
                        });
                        if (texts.length > 0) {
                            this._tagList[comment._id].push({
                                commentId: comment._id,
                                posts: tag.posts,
                                tagId: tag._id,
                                tag: tag.tag ? tag.tag : tag.name,
                                texts: texts
                            });
                        }
                    }
            });   
        });
        this.getTagListForLocaleComments();
    }

    getTagListForLocaleComments = () => {
        this._localeCommentsTagList = {};
        let tagData = this._questionTags.concat(this._studyTags);
        let commentsWithLocale = this._comments.filter(c=> c.localeComment);
        
        if (commentsWithLocale && commentsWithLocale.length > 0) {
            commentsWithLocale.map(comment => {
                this._localeCommentsTagList[comment.localeComment._id] = [];
                tagData.map(tag => {
                    if (tag.texts) {
                        var texts = [];
                        tag.texts.map(textObj => {
                            if (textObj.comment === comment.localeComment._id) {
                                texts.push(textObj.text);
                            }
                        });
                        if (texts.length > 0) {
                            this._localeCommentsTagList[comment.localeComment._id].push({
                                commentId: comment.localeComment._id,
                                posts: tag.posts,
                                tagId: tag._id,
                                tag: tag.tag ? tag.tag : tag.name,
                                texts: texts
                            });
                        }
                    }
                });
            })
        }
        
    }
    
    getDisplayableTagsForDropDown = () => {
        const studyTags = Utility.convertToDisplayInDropDown(this._studyTags);
        const questionTags = Utility.convertQuestionTagsToDisplayInDropDown(this._questionTags);
        const allTags = questionTags.concat(studyTags);
        return allTags;
    }

    updateTagList = async () => {
        await this.fetchAllTags();
        await this.getTagListForComments();
        this._optionsData = this.getDisplayableTagsForDropDown();
    }

    updateUIData = async () => {
        this._studyId = this.props.studyId;
        this._comments = this.props.comments;
        this.setState({ refresh: !this.state.refresh }, async () => {
            await this.updateTagList();
            this.setState({ refresh: !this.state.refresh });
        });
        //this.refreshUI();
        //await this.updateTagList();
        //this.refreshUI();
    }

    /* Lifecycle handlers */

    async componentDidMount () {
        // await this.updateUIData();
    }

    async componentDidUpdate (prevProps) {
        if(prevProps.comments !== this.props.comments){
            await this.updateUIData();
        }
    }

    /* PostCommentEditable handlers */

    updateComment = async (updatedComment, updateLocale) => {
        await this.props.updateCommentHandler(updatedComment, updateLocale);
        // after updating comment, update tags
        await this.updateTagList();
        this.refreshUI();
    }

    removeComment = (commentId) => {
        this.commentToDelete = commentId;
        this.setState({showDeleteCommentModal: true});
    }

    deleteComment = async () =>{
        if (this.commentToDelete) {
            this.setState({deletingComment: true}, async()=> {
                await this.props.deleteCommentHandler(this.commentToDelete);
                for(let i = 0; i<this._comments.length; i++) {
                    if(this._comments[i]._id === this.commentToDelete) {
                        this._comments.splice(i,1);
                    }
                }
                //this._comments = this._comments.filter(comment => comment._id !== this.commentToDelete);
                this.setState({
                    deletingComment: false,
                    showDeleteCommentModal: false
                });
            })
        }
    }

    closeDeleteCommentModal = () =>{
        this.setState({showDeleteCommentModal: false});
    }

    handleTextSelection=(left, top, selectedText,commentId, display, isLocale = false)=> {
        this.commentId = commentId;
        this.selectedText = selectedText;
        this.left = left; // image gallery
        this.top = top;// height of header
        this.display = display;
        this._commentType = isLocale ? "LocaleComment" : "Comment";
        this.refreshUI();
    }

    renderDeleteCommentDialog() {
        return <DialogModal refresh={this.state.deletingComment} showModal={this.state.showDeleteCommentModal} modalCloseHandler={this.closeDeleteCommentModal}>
                <div>
                    <div className="modal-header"><h3>Comment</h3>
                    </div>
                    <div className="modal-body">
                        <p>This is permanent and can't be undone! All information related to the comment will be permanently lost.</p>
                    </div>
                    <div className="modal-footer text-right">
                        <div className="button-group">
                            <button className="button cancel" disabled={this.state.deletingComment} onClick={this.closeDeleteCommentModal}>Cancel</button> 
                            <button className="button remove" disabled={this.state.deletingComment} onClick={this.deleteComment}>Remove</button>
                        </div>
                    </div>
                </div>
              </DialogModal>
    }

    /* PostCommentTag Handlers */

    hideTagDropdownAndRefreshUI=()=> {
        this.display = 'none';
        this.refreshUI();
    }

    isValidTag = (tagId, tagList) => {
        for (let tag of tagList) {
            if (tag._id == tagId) {
                return true;
            }
        }
        return false;
    }

    onAddTagClickHandler = async(tagId) => {
        if (this.isValidTag(tagId, this._studyTags)) {
            await this._tagService.addStudyTagV3(tagId, {
                text: this.selectedText,
                participant: this.props.participantId,
                comment: this.commentId,
                entity: this.commentId,
                onModel: this._commentType
            });
            await this.getStudyTags();
        } else if (this.isValidTag(tagId, this._questionTags)) {
            await this._questionaireService.addQuestionaireTag(tagId, {
                text: this.selectedText,
                participant: this.props.participantId,
                comment: this.commentId,
                entity: this.commentId,
                onModel: this._commentType
            });
            await this.getQuestionTags();
        }
        this.getTagListForComments();
        this._optionsData = this.getDisplayableTagsForDropDown();
        this.hideTagDropdownAndRefreshUI();
    }

    onRemoveTagClickHandler = async(tagId, commentId) => {
        if (this.isValidTag(tagId, this._studyTags)) {
            await this._tagService.removeStudyTagV3(tagId, {
                text:"",
                participant: this.props.participantId,
                comment: commentId
            });
            await this.getStudyTags();
        } else if (this.isValidTag(tagId, this._questionTags)) {
            await this._questionaireService.removeQuestionaireTag(tagId, {
                text:"",
                participant: this.props.participantId,
                comment: commentId
            });
            await this.getQuestionTags();
        }
        this.getTagListForComments();
        this._optionsData = this.getDisplayableTagsForDropDown();
        this.refreshUI();
    }

    // bind image to tags
    onTagToPostClicked = async (tagId, postId) => {
        if (this.isValidTag(tagId, this._studyTags)) {
            await this._tagService.addStudyTag(tagId, {post: postId});
            await this.getStudyTags();
        } else if (this.isValidTag(tagId, this._questionTags)) {
            await this._questionaireService.addQuestionTagToPost(tagId, {post: postId});
            await this.getQuestionTags();
        }
        this.getTagListForComments();
        this._optionsData = this.getDisplayableTagsForDropDown();
        this.refreshUI();
    }

    getStudyTags = async() => {
        const studyResponse = await this._tagService.getStudyTags(this._studyId);
        if (studyResponse && !studyResponse.error) {
            this._studyTags = studyResponse.data;
        }
    }

    getQuestionTags = async() => {
        const questionResponse = await this._questionaireService.getQuestionTags(this._studyId);
        if (questionResponse && !questionResponse.error) {
            this._questionTags = questionResponse.body;
        }
    }

    onRemoveTaggedPost = async (tagId, postId) => {
        if (this.isValidTag(tagId, this._studyTags)) {
            await this._tagService.removeStudyTag(tagId, {post: postId});
            await this.getStudyTags();
        } else if (this.isValidTag(tagId, this._questionTags)) {
            await this._questionaireService.removeQuestionTagFromPost(tagId, {post: postId});
            await this.getQuestionTags();
        }
        this.getTagListForComments();
        this._optionsData = this.getDisplayableTagsForDropDown();
        this.refreshUI();
    }

    onUpdateStudyTag=async()=> {
        await this.getStudyTags();
        this.getTagListForComments();
        this._optionsData = this.getDisplayableTagsForDropDown();
        this.refreshUI();        
    }

    onCreateTag = async (tagText) => {
        const user = _cookieService.user;
        if (user && user._id ) {
            const tagData = {
                name: tagText,
                createdBy: user._id,
                study: this.props.studyId
            }
            const response = await this._tagService.createTags(tagData);
            await this.onUpdateStudyTag();
            return response;
        }
    }

    render() {
        const {isResolved} = this.props;
        const user = _cookieService.user;
        let tagOperationAllowed = false;
        let commentEditable = !isResolved;
        if (user && user.userType
            && (user.userType.trim().toLowerCase() === UserType.MODERATOR
                || user.userType.trim().toLowerCase() === UserType.ADMIN
                || user.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR)) 
        {
            commentEditable = !isResolved;
            tagOperationAllowed = true;
        }
        else {
            commentEditable = false;
        } 
        return (
            <div className="comments-container">
                <div className="comments-row">
                    {
                        this._comments && this._comments.length > 0 ?
                            this._comments.map((comment, index) =>
                                <PostCommentEditable
                                    key={`${this.props.participantId}-${comment._id}`}
                                    studyId={this.props.studyId}
                                    participantId={this.props.participantId}
                                    editable={commentEditable}
                                    tagOperationAllowed={tagOperationAllowed}
                                    tagList={this._tagList[comment._id]}
                                    comment={comment}
                                    localeCommentsTagList={Object.keys(this._localeCommentsTagList).length > 0 ? comment.localeComment ? this._localeCommentsTagList[comment.localeComment._id] : [] : []}
                                    onSelect={this.handleTextSelection}
                                    onDeleteHandler={this.removeComment}
                                    onSaveHandler={this.updateComment}
                                    onRemoveTagClickHandler={this.onRemoveTagClickHandler}
                                    onTagToPostClicked={this.onTagToPostClicked}
                                    onRemoveTaggedPost={this.onRemoveTaggedPost}
                                />
                                )
                            : (<div className="comment-header">
                                <div className="comment-body">
                                    <h3 className="nocomment">No comments</h3>
                                </div>
                            </div>)
                    
                    }
                    {
                        this.display === 'block' &&
                        <div className="tag-select-container" style={{left:this.left, top:this.top, position:'absolute'}}>
                            <PostCommentTag
                                optionsData={this._optionsData}
                                clearSelectedOption={this.clearSelectedOption}
                                onCloseHandler={this.hideTagDropdownAndRefreshUI}
                                onAddClickHandler={this.onAddTagClickHandler}
                                onCreateTag={this.onCreateTag}
                                studyTags={this._studyTags}
                                questionTags={this._questionTags}
                            />
                        </div>
                    }

                    {this.renderDeleteCommentDialog()}
                </div>
            </div>

        );
    }
}

export default Posts;