import React, { Component } from 'react';
import './style.scss';
import PostImageGallery from './post-image-gallery';
import PostComment from './post-comment';
import Posts from './posts';
import { FaPrint, FaUser } from "react-icons/fa";
import PropTypes from 'prop-types';
import Utility from '../../../../utility/Utility';
import ParticipantController from '../../participant-profile/participantProfile';
import RoutesUtility from '../../../../utility/routesutility';
import CommentService from '../../../../services/commentService';
import DialogModal from '../../../widgets/dialog-modal';
import Loader from '../../../widgets/loader';
import AddPost from '../add-post';
import PostMedia from './post-media';
import QuestionaireService from '../../../../services/questionaireService';
import CookieService from '../../../../services/cookieservice';
import UserType from '../../../../common/userType';

const _cookieService = CookieService.instance;

class ParticipantsPost extends Component {

    _participantController;
    selectedPost;
    selectedPostIndex = 0;
    left; top; display = 'none';
    translatedQuestion = "";
    isQuestionMediaOnly = false;
    constructor(props) {
        super(props);
        this.state = {
            refresh: false,
            showDeletePostDialog: false,
            deletingPost: false,
            showCreatePost: false,
            showMediaModal: false,
            isTranslating: false,
        }

        this.user = _cookieService.user;

        this._participantController = new ParticipantController(this);
        this.imageGallery = React.createRef();
        this.onPrintClicked = this.onPrintClicked.bind(this);
        this.onCreatePost = this.onCreatePost.bind(this);
        this.handlePostClick = this.handlePostClick.bind(this);
        this.postImageGalleryScroll = this.postImageGalleryScroll.bind(this);
        this.handleSaveComment = this.handleSaveComment.bind(this);
        this.showDeletePostDialog = this.showDeletePostDialog.bind(this);
        this.showCreatePostDialog = this.showCreatePostDialog.bind(this);
        this.showPostMediaDialog = this.showPostMediaDialog.bind(this);
    }
    refreshUI = () => {
        this.setState({refresh: !this.state.refresh});
    }

    displayMediaModal = () =>{
        this.setState({showMediaModal: true});
    }

    closeMediaModal = () =>{
        this.setState({showMediaModal: false});
    }

    onPrintClicked() {
        this.props.history.push(RoutesUtility.PRINT_PARTICIPANT_POSTS(this.props.participantId));
    }

    onCreatePost () {
        this.setState({showCreatePost: true});
    }

    onTranslateClicked = async () => {
        this.setState({ isTranslating: true });
        const translatedData = await this._participantController.translateQuestion(this.selectedPost.questionnaire.task);
        if(translatedData) {
            this.selectedPost.questionnaire.task_translated = translatedData.body[0].translatedText;
            await this._participantController.updateTranslatedQuestion(this.selectedPost.questionnaire._id, translatedData.body[0].translatedText);
        }

        await this._participantController.translatePostComment();
        this.setState({ isTranslating: false });
    }

    deleteCommentHandler = async (commentId) => {
        await this._participantController.deletePostComment(commentId);
    }

    updateCommentHandler = async (updatedComment, updateLocale) => {
        await this._participantController.updatePostComment(updatedComment, updateLocale);
    }

    clearSelectedOption=()=> {

    }

    handleResolveClick = async(e)=>{
        this.selectedPost = await this.props.markPostAsResolved(e, this.selectedPost._id);
        this.refreshUI();
    }

    handleDeleteClick = () =>{
        this.setState({showDeletePostDialog: true});
    }

    participantDetails = () => {
        const {user, group, description} = this.props.participantData;
        this.user = _cookieService.user;
        const showFullParticipantName = (this._user && (this._user.userType.toLowerCase() === UserType.ADMIN));
        return <>
            <div className="user-info">
                <div className="row1 capitalize">
                    <h4> { showFullParticipantName ? `${user.firstName} ${user.lastName}`: `${user.firstName} ${user.lastName.charAt(0).toUpperCase()}`}</h4>
                </div>
                <div className="row2">
                    <div>
                        <FaUser color={"#696969"} size={14} /> <span>{group.name}</span>
                    </div>
                    <div>
                        <span className="info">Gender:</span><span className="desc capitalize"> {user.gender}</span>
                    </div>
                    <div>
                        <span className="info">Age:</span><span className="desc">{user.birthdate ? Utility.getAge(user.birthdate) : 'N/A'}</span>
                    </div>
                </div>
                <div className="row3">
                    <div>
                        <span className="info">Location: </span>
                        <span className="desc capitalize">{this._participantController.getLocation(user.city, user.state, user.country)}</span>
                    </div>
                    <div>
                        <span className="info">Occupation:</span><span className="desc capitalize"> {user.occupation ? user.occupation : "N/A"}</span>
                    </div>
                </div>
                <div className="row4">
                    <span>
                       {
                           description
                       }
                    </span>
                </div>
            </div>
            <div className="user-action">
                <div className="col1">
                    <button className={this.state.isTranslating ? "button loading-button" : "button" } onClick={this.onTranslateClicked}>
                        <span>{this.state.isTranslating? "Translating..." : "Translate"}</span>
                    </button>
                </div>
                {
                    (this.user && this.user._id && this.user.userType &&
                        (this.user.userType.trim().toLowerCase() === UserType.ADMIN 
                            || this.user.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR
                            || this.user.userType.trim().toLowerCase() === UserType.MODERATOR))
                    && (<div className="col2">
                        <div> 
                            {
                                !this.isQuestionMediaOnly &&
                                <span>Resolved: <input type="checkbox" onChange={this.handleResolveClick} checked={this.selectedPost ? this.selectedPost.isPostResolved : false} /></span>
                            }
                        </div>
                        {
                            (this.user.userType.trim().toLowerCase() === UserType.ADMIN && !this.isQuestionMediaOnly)
                            && <span className="delete-post" onClick={this.handleDeleteClick}>
                                Delete Post
                            </span>
                        }
                    </div>)
                }
               
            </div>
        </>;
    }

    async handlePostClick(post, index) {
        //fetch post comments only when clicked post is not selected post
        if(this.selectedPost && this.selectedPost._id) {
            this.props.updateLastPost(this.selectedPost._id);
        }
        if(!post._id) {
            this.isQuestionMediaOnly = true;
            this.selectedPost = post;
            // set to resolve to disabled comment box
            this._participantController.postComments = [];
            this.refreshUI();
        }
        else {
            this.isQuestionMediaOnly = false;
            if (this.selectedPost._id !== post._id) {
                this.selectedPost = post;
                if (this.selectedPost && this.selectedPost.hasOwnProperty("isResolved") && !this.selectedPost.isResolved) {
                    await this._participantController.updatePostReadStatus({ post: this.selectedPost._id });
                }    
                this.selectedPostIndex = index;
                let videoUrls = [];
                let videos = [];
                if (this.selectedPost) {
                    await this._participantController.getPostComments(this.selectedPost._id);
                    if (this.selectedPost.media && this.selectedPost.media.length > 0) {
                        //const _videos = this.selectedPost.media.filter(p => p.video).map(f => f.video);
                        videoUrls = [...this.selectedPost.media]
                    }
                    else if (this.selectedPost.videoUrl) {
                        videoUrls.push(this.selectedPost.videoUrl);
                    }
                    if (videoUrls.length > 0) {
                        await this._participantController.getVideoTranscribeComments(videoUrls, this.props.participantData.study.disableTranscribe)
                    }
                    await this._participantController.fetchLocaleComments()
                }
                this.refreshUI();
            }
        }
    }

    async componentDidMount() {
        const { posts, studyId, selectedPostId } = this.props;
        this.user = _cookieService.user;
        if (posts && posts.length > 0) {
            if(selectedPostId) {
                this.selectedPostIndex = posts.findIndex(p=> p._id === selectedPostId);
                if(this.selectedPostIndex < 0) {
                    this.selectedPostIndex = 0;
                }
            }
            this.selectedPost = posts[this.selectedPostIndex];
            if (this.selectedPost && this.selectedPost.hasOwnProperty("isResolved") && !this.selectedPost.isResolved) {
                await this._participantController.updatePostReadStatus({ post: this.selectedPost._id });
            }  
            let videoUrls = [];
            if(this.selectedPost && this.selectedPost._id) {
                await this._participantController.getPostComments(this.selectedPost._id);
               
                if(this.selectedPost.media && this.selectedPost.media.length > 0) {
                    const videoVideos = this.selectedPost.media.filter(p=> (p.video || p.videoObjectKey)).map(f=>(f.videoObjectKey || f.video));
                    videoUrls = [...videoVideos]
                }
    
                else if(this.selectedPost.videoUrl) {
                    videoUrls.push(this.selectedPost.videoUrl);
                }
                if(videoUrls.length > 0) {
                    await this._participantController.getVideoTranscribeComments(videoUrls, this.props.participantData.study.disableTranscribe)
                }
                await this._participantController.fetchLocaleComments()
            }
            else {
                this.isQuestionMediaOnly = true;
                // set to resolve to disabled comment box
                this._participantController.postComments = [];
            }

            this.refreshUI();
        } 
    }

    async postImageGalleryScroll(e) {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if(bottom) {
            await this.props.fetchMorePosts();
            this.refreshUI();
        }
    }

    async handleSaveComment(text) {
        const response = await this._participantController.createComment(this.selectedPost._id, text, this.selectedPost);
        if(response && response.body) {
            const { participantId } = this.props;
            const postStatus = {};
            postStatus["participant"] = participantId;
            postStatus["action"] = "comment_add";
            postStatus["post"] = this.selectedPost._id;
            await this._participantController.updatePostSatus(postStatus);
            if (!this.selectedPost._id) {
                await this.props.refetchPosts()
            }
            const { posts} = this.props;
            if (response.body["post"]) {                
                this.selectedPostIndex = posts.findIndex(p => p._id === response.body["post"]);
                if (this.selectedPostIndex < 0) {
                    this.selectedPostIndex = 0;
                }
            }
            this.selectedPost = posts[this.selectedPostIndex];   
            this.isQuestionMediaOnly = false;
            await this.fetchSelectedPostComments();
            this.refreshUI();
            return response;
        }
    }

    closeDeletePostModal = ()=>{
        this.setState({showDeletePostDialog: false});
    }

    closeCreatePost = () =>{
        this.setState({showCreatePost: false});
    }

    removePost = () =>{
        this.setState({deletingPost: true}, async()=>{
            await this.props.removePost(this.selectedPost);
            const { posts } = this.props;
            if(posts && posts.length > 0) {
                this.selectedPostIndex = this.selectedPostIndex === 0 ? 0 : (this.selectedPostIndex > posts.length - 1) ? posts.length - 1 :  this.selectedPostIndex;
                this.selectedPost = posts[this.selectedPostIndex];
                if(this.selectedPost._id) {
                    this.refreshUI();
                    await this.fetchSelectedPostComments()
                }
                else {
                    this.isQuestionMediaOnly = true;
                    // set to resolve to disabled comment box
                    this._participantController.postComments = [];
                }
            }
            this.setState({deletingPost: false, showDeletePostDialog: false});
        })
       
    }

    fetchSelectedPostComments = async () => {
        let videoUrls = [];
        await this._participantController.getPostComments(this.selectedPost._id);
        if (this.selectedPost.media && this.selectedPost.media.length > 0) {
            const videoVideos = this.selectedPost.media.filter(p=> (p.video || p.videoObjectKey)).map(f=>(f.videoObjectKey || f.video));
            videoUrls = [...videoVideos]
        }
        else if (this.selectedPost.videoUrl) {
            videoUrls.push(this.selectedPost.videoUrl);
        }

        if (videoUrls.length > 0) {
            await this._participantController.getVideoTranscribeComments(videoUrls, this.props.participantData.study.disableTranscribe)
        }
        await this._participantController.fetchLocaleComments();
    }

    showDeletePostDialog() {
        return (
            <div>
                <DialogModal
                    className="delete-post-modal"
                    refresh={this.state.deletingPost}
                    showModal={this.state.showDeletePostDialog}
                    modalCloseHandler={this.closeDeletePostModal} >
                    <div>
                        <div className="modal-header">
                            <h3>Delete Post</h3>
                        </div>
                        <div className="modal-body">
                            <p>This is permanent and can't be undone! Content and comments from this post will be permanently lost.</p>
                        </div>
                        <div className="modal-footer text-right">
                            {
                                this.state.deletingPost && (
                                    <div className="delete-status">
                                        <span><Loader /> </span>
                                        <span className="loader-text">Removing Post...</span>
                                    </div>
                                )
                            }
                            <div className="button-group">
                                <button className="button cancel" disabled={this.state.deletingPost} onClick={this.closeDeletePostModal}>Cancel</button>
                                <button className="button remove" disabled={this.state.deletingPost} onClick={this.removePost}>Remove</button>
                            </div>
                        </div>
                    </div>
                </DialogModal>
            </div>
        );
    }

    onAfterCreatePost = async () =>{
        await this.props.refetchPosts();
        const { posts, selectedPostId } = this.props;
        if (selectedPostId) {
            this.selectedPostIndex = posts.findIndex(p => p._id === selectedPostId);
            if (this.selectedPostIndex < 0) {
                this.selectedPostIndex = 0;
            }
        }
        this.selectedPost = posts[this.selectedPostIndex];   
        await this.fetchSelectedPostComments();
        this.refreshUI();
    }

    showCreatePostDialog() {
        const {participantData} = this.props;
        const selectedGroup = {"value": participantData.group._id, "label": participantData.group.name};
        return (
            <div>
            <DialogModal className="add-post-modal" showModal={this.state.showCreatePost} modalCloseHandler={this.closeCreatePost}> 
                {
                    <AddPost 
                        type="participant"
                        participants={participantData}
                        selectedGroup={selectedGroup} 
                        studyId={participantData.study._id}
                        groupId={participantData.group._id}
                        refetchPosts={this.onAfterCreatePost}
                        closeModal={this.closeCreatePost} />
                }
            </DialogModal>
            </div>
        );
    }

    onUpdatePostmedia = (updatedMedia)=> {
        this.props.updatePostMedia(this.selectedPost, updatedMedia);
        const {posts} = this.props;
        this.selectedPost = posts[this.selectedPostIndex];
    }

    showPostMediaDialog() {
        let tagOperationAllowed = false;
        if(this.user && this.user.userType 
            && (this.user.userType.trim().toLowerCase() === UserType.MODERATOR 
                || this.user.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR
                || this.user.userType.trim().toLowerCase() === UserType.ADMIN) ) {
            tagOperationAllowed = true;
        }
        return (
            <div>
                <DialogModal className="post-media-modal" showModal={this.state.showMediaModal} modalCloseHandler={this.closeMediaModal}> 
                    {
                        <PostMedia 
                            tagOperationAllowed={tagOperationAllowed}
                            post={this.selectedPost} 
                            studyId={this.props.studyId} 
                            updatedPostMedia={this.onUpdatePostmedia} />
                    }
                </DialogModal>
            </div>
        );
    }


    handledMediaFullScreen = () =>{
        this.displayMediaModal();
    }

    renderAddPostComment = () => {
        if (this.user && this.user._id && this.user.userType &&
            (this.user.userType.trim().toLowerCase() === UserType.ADMIN 
                || this.user.userType.trim().toLowerCase() === UserType.MODERATOR
                || this.user.userType.trim().toLowerCase() === UserType.CLIENT_ADMINISTRATOR)) {
            return (
                <div className="comment-box">
                    <PostComment
                        disabled={this.selectedPost ? this.selectedPost.isPostResolved : false}
                        saveComment={this.handleSaveComment} />
                </div>
            )
        }
        else {
            return <div className="comment-box"> </div>;
        }

    }
    
    fetchLocaleComments = async(comments) =>{
        return await this._participantController.fetchLocaleComments(comments);
    }

    render() {
        const {postCount, participantData, posts} = this.props;
        return (
            <div className="participant-posts">
                <div className="participant-post-header">
                    <div className="header-wrapper capitalize">
                        <h3>
                            {participantData.user.firstName}'s Posts ({postCount})
                        </h3>
                        <FaPrint className={this.selectedPost ? "print-icon" : "print-icon disable-print-icon"} color={"#27a1ef"} size={20} onClick={this.onPrintClicked} />
                        <div className="create-post">
                            {(this.user && this.user._id && this.user.userType &&
                                (this.user.userType.trim().toLowerCase() === UserType.ADMIN 
                                || this.user.userType.trim().toLowerCase() === UserType.CLIENT_ADMINISTRATOR
                                || this.user.userType.trim().toLowerCase() === UserType.MODERATOR))
                                && (<span  onClick={this.onCreatePost}> Create Post</span>)  
                            }
                        </div>
                    </div>
                </div>
                <div className="container-body">
                    <div className="image-gallery-container" ref={this.imageGallery} onScroll={this.postImageGalleryScroll}>
                        <PostImageGallery 
                            mediaFullScreen={this.handledMediaFullScreen} 
                            selectedPostIndex={this.selectedPostIndex} 
                            selectedPost={this.selectedPost}
                            posts={posts} 
                            postClick={this.handlePostClick} />
                    </div>
                    {
                        posts && posts.length > 0
                        ?
                        <div className={`paticipant-detail-container ${this.user && this.user.userType.trim().toLowerCase() === UserType.ADMIN || this.user.userType.trim().toLowerCase() === UserType.MODERATOR || this.user.userType.trim().toLowerCase() === UserType.CLIENT_ADMINISTRATOR ? '' : 'hide-comments'}`}>
                            <div className="participant-details">
                                {
                                    this.participantDetails()
                                }
                            </div>
                            
                            <div className="post-comments">
                                {
                                    (this.selectedPost && this.selectedPost.questionnaire)
                                    && (<div className={this.selectedPost.questionnaire.task_translated?"question-row translated-question-row":"question-row"}>
                                        <span>
                                            {`${this.selectedPost.tag}. ${this.selectedPost.questionnaire.task}`}
                                        </span>
                                        {
                                            this.selectedPost.questionnaire.task_translated &&
                                            <span className="translated-question">
                                                {`${this.selectedPost.tag}. ${this.selectedPost.questionnaire.task_translated}`}
                                            </span>
                                        }
                                    </div>)
                                }
                            
                                <Posts
                                    studyId={this.props.studyId}
                                    participantId={this.props.participantId}
                                    isResolved={this.selectedPost ? this.selectedPost.isPostResolved : false} 
                                    comments={this._participantController.postComments} 
                                    fetchLocaleComments={this.fetchLocaleComments}
                                    deleteCommentHandler={this.deleteCommentHandler}
                                    updateCommentHandler={this.updateCommentHandler}
                                />

                            </div>
                            {
                                this.renderAddPostComment()
                            }
                        </div>
                        : <div className="nocomment-box">
                            There are no posts.  
                            { (this.user && this.user._id && this.user.userType &&
                                (this.user.userType.trim().toLowerCase() === UserType.ADMIN 
                                    || this.user.userType.toLowerCase() === UserType.CLIENT_ADMINISTRATOR
                                    || this.user.userType.trim().toLowerCase() === UserType.MODERATOR)) 
                                    && <span onClick={this.onCreatePost}> Create one now.</span>
                            }
                        </div>
                    }
                </div>
                {this.showDeletePostDialog()}
                {this.showCreatePostDialog()}
                {this.showPostMediaDialog()}
            </div>
        );
    }
}

ParticipantsPost.propTypes = {
    userData: PropTypes.object,
    postCount: PropTypes.number,
    posts: PropTypes.array,
    studyId: PropTypes.string,
    selectedPostId: PropTypes.string
}

export default ParticipantsPost;