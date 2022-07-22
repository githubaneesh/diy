import React, { Component } from 'react';
import './style.scss';
import moment from 'moment';
import { FaPencilAlt, FaTimes } from "react-icons/fa";
import SelectTag from '../../select-tag';
import UserType from '../../../../../common/userType';
import CookieService from '../../../../../services/cookieservice';
import GoogleTranslateService from '../../../../../services/googletranslate';


const _cookieService = CookieService.instance;
const _googleTranslate = GoogleTranslateService.instance;
class PostCommentEditable extends Component {

    _editedComment = "";
    _comment = {};
    _tagList = [];
    _postList = [];
    selectedCommentLanguage;
    _mounted = false;

    constructor(props) {
        super(props);
        this.state = {
            commentEditable: false,
            localeCommentEditable: false,
            refresh: false,
        }
        this._comment = this.props.comment || {};
        this._tagList = this.props.tagList || [];
        this._postList = this.props.postList || [];
        this._localeCommentsTagList = this.props.localeCommentsTagList || [];

    }

    /* Lifecycle handlers */

    async componentDidUpdate(prevProps) {
        if(prevProps !== this.props){
            this._comment = this.props.comment;
            this._tagList = this.props.tagList;
            this._localeCommentsTagList = this.props.localeCommentsTagList;
            await this.getSelectedCommentLanguage();
            if(this._mounted) {
                this.setState({ refresh: !this.state.refresh });
            }
        }
    }

    async componentDidMount() {
        this._mounted = true;
        await this.getSelectedCommentLanguage();
        this.setState({ refresh: !this.state.refresh });
    }

    showCommentEditor = (editLocale) => {
        if (editLocale) {
            this.setState({ localeCommentEditable: true });
        } else {
            this.setState({ commentEditable: true });
        }
    }

    hideCommentEditor = () => {
        this._editedComment = "";
        this.setState({ commentEditable: false, localeCommentEditable: false });
    }

    onEditHandler = (event, editLocale=false) => {
        // hide existing editor
        this.hideCommentEditor();
        this.showCommentEditor(editLocale);
    }

    onDeleteHandler = () => {
        this.props.onDeleteHandler(this._comment._id);
    }

    onChangeHandler = (event) => {
        this._editedComment = event.target.value;
    }

    onSaveHandler = (event, locale=false) => {
        if (this._editedComment) {
            if (locale) {
                if (this._editedComment.trim() && this._editedComment.trim() !== this._comment.localeComment.text.trim()) {
                    this._comment.localeComment.text = this._editedComment;
                    this.props.onSaveHandler(this._comment.localeComment, locale);
                }
            } else {
                if (this._editedComment.trim() && this._editedComment.trim() !== this._comment.text.trim()) {
                    this._comment.text = this._editedComment;
                    this.props.onSaveHandler(this._comment, locale);
                }
            }
        }
        this.hideCommentEditor();
    }

    onCancelHandler = () => {
        this.hideCommentEditor();
    }

    onRemoveTagClickHandler = async(tagId, commentId) => {
        await this.props.onRemoveTagClickHandler(tagId, commentId);
    }

    async getSelectedCommentLanguage() {
        if (!this.selectedCommentLanguage) {
            if (this._comment && this._comment.localeComment) {
                this.selectedCommentLanguage = this._comment.localeComment.locale;
            }
            else {
                const detectResponse = await _googleTranslate.detectLanguage([this._comment.text]);
                if (detectResponse && !detectResponse.error) {
                    this.selectedCommentLanguage = detectResponse.body.language
                }
            }
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }
    render() {
        const user = _cookieService.user;
        return (
            <>
                {
                    this._comment.text && this._comment.text.trim() ?
                        <div className="comment-wrapper">
                            <div className="comment-header">
                                <div className="user-and-action capitalize">
                                    <span>{this._comment.createdBy.firstName}</span>
                                    {
                                        (this._comment.createdBy
                                            && this._comment.createdBy.userType
                                            && (this._comment.createdBy.userType.toLowerCase() === UserType.ADMIN
                                                || this._comment.createdBy.userType.toLowerCase() === UserType.MODERATOR
                                                || this._comment.createdBy.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR)
                                        ) && <span className="comment-user-type"> <em>({this._comment.createdBy.userType})</em></span>
                                    }
                                    {
                                        (this._comment.createdBy
                                            && this._comment.createdBy.userType
                                            && user.userType.trim().toLowerCase() === UserType.ADMIN)
                                            ? this.props.editable &&
                                            <span>
                                                <span className="comment-edit" onClick={this.onEditHandler}><FaPencilAlt size="14" /></span>
                                                <span className="comment-delete" onClick={this.onDeleteHandler}><FaTimes size="14" /></span>
                                            </span>
                                            : this._comment.createdBy && this._comment.createdBy.userType
                                                && ((this._comment.createdBy.userType.toLowerCase() === UserType.MODERATOR
                                                        || this._comment.createdBy.userType.toLowerCase() === UserType.PROSPECT
                                                        || this._comment.createdBy.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR)
                                                    && (user.userType.trim().toLowerCase() === UserType.MODERATOR
                                                        || user.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR))
                                                ? this.props.editable &&
                                                <span>
                                                    <span className="comment-edit" onClick={this.onEditHandler}><FaPencilAlt size="14" /></span>
                                                    <span className="comment-delete" onClick={this.onDeleteHandler}><FaTimes size="14" /></span>
                                                </span>
                                                : null
                                    }
                                </div>
                                <span>{`${moment(this._comment.createdAt).format("MMM Do")} at ${moment(this._comment.createdAt).format("hh:mm a")}`}</span>
                            </div>
                            {
                                !this.state.commentEditable ?
                                    <div className="comment-body">
                                        <SelectTag
                                            studyId={this.props.studyId}
                                            participantId={this.props.participantId}
                                            tagOperationAllowed={this.props.tagOperationAllowed}
                                            tagList={this._tagList}
                                            comment={this._comment}
                                            onSelect={this.props.onSelect}
                                            commentLanguage={this.selectedCommentLanguage}
                                            onRemoveClickHandler={(tagId) => this.onRemoveTagClickHandler(tagId, this._comment._id)}
                                            onTagToPostClicked={this.props.onTagToPostClicked}
                                            onRemoveTaggedPost={this.props.onRemoveTaggedPost}>
                                        </SelectTag>
                                    </div>
                                    : <div className="comment-body">
                                        <textarea onChange={(event) => this.onChangeHandler(event)} disabled={!this.state.commentEditable} rows="4" defaultValue={this._comment.text}></textarea>
                                        <button className="button" hidden={!this.state.commentEditable} onClick={this.onSaveHandler}>Save</button>
                                        <button className="button" hidden={!this.state.commentEditable} onClick={this.onCancelHandler}>Cancel</button>
                                    </div>
                            }
                            {
                                this._comment.localeComment &&
                                (
                                    !this.state.localeCommentEditable ?
                                        <div className="comment-body translate-txt">
                                            {/* {this._comment.localeComment.text} */}
                                            <SelectTag
                                                studyId={this.props.studyId}
                                                participantId={this.props.participantId}
                                                tagOperationAllowed={this.props.tagOperationAllowed}
                                                tagList={this._localeCommentsTagList}
                                                comment={this._comment.localeComment}
                                                onSelect={this.props.onSelect}
                                                onRemoveClickHandler={(tagId) => this.onRemoveTagClickHandler(tagId, this._comment.localeComment._id)}
                                                onTagToPostClicked={this.props.onTagToPostClicked}
                                                onRemoveTaggedPost={this.props.onRemoveTaggedPost}
                                                localeCommentEl={true}
                                                editable={this.props.editable}
                                                onEditHandler={this.onEditHandler} >
                                            </SelectTag>
                                        </div>
                                        : <div className="comment-body">
                                            <textarea onChange={(event) => this.onChangeHandler(event)} disabled={!this.state.localeCommentEditable} rows="4" defaultValue={this._comment.localeComment.text}></textarea>
                                            <button className="button" hidden={!this.state.localeCommentEditable} onClick={(event) => { this.onSaveHandler(event, true) }}>Save</button>
                                            <button className="button" hidden={!this.state.localeCommentEditable} onClick={this.onCancelHandler}>Cancel</button>
                                        </div>
                                )
                            }
                        </div>
                        : null
                }
            </>
        );
    }
}

export default PostCommentEditable;