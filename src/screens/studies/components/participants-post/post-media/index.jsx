import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Carousel } from 'react-responsive-carousel';
import look_read_only_large from "../../../../../assets/look_read_only_large.png"
import media_response from "../../../../../assets/media_response_small.png";
import DisplayImage from '../../../../widgets/display-image';
import DisplayVideo from '../../../../widgets/display-video';
import DropdownCreatable from '../../../../widgets/dropdown-creatable';
import PostMediaController from './postMedia';
import AutoSaveTextArea from '../../../../widgets/auto-save-textarea';
import "./style.scss";
import Tag from '../../select-tag/tag';


class PostMedia extends Component {

    selectedMedia;
    _controllerPostMedia;
    mediaTags = [];
    selectedMediaIndex = 0;
    selectedTag = null;
    postMedia;
    isQuestionMedia = false;
    constructor(props) {
        super(props);

        this.state = {
            refresh: false
        }

        this._controllerPostMedia = new PostMediaController(this);

        this.renderMediaCarousel = this.renderMediaCarousel.bind(this);
        this.handleCarouselChange = this.handleCarouselChange.bind(this);
        this.renderAddTags = this.renderAddTags.bind(this);
    }

    statusFormatter =(current, total)=>{
        return `${current} / ${total}`;
    }

    handleCarouselChange (index, item) {
        const {post} = this.props;
        this.selectedMedia = this.postMedia[index];
        this.isQuestionMedia = this.selectedMedia.isQuestionMedia ? this.selectedMedia.isQuestionMedia : false;
        this.selectedMediaIndex  = index;
        this.refreshUI();
    }

    refreshUI = () =>{
        this.setState({refresh: !this.state.refresh});
    }

    async componentDidMount() {
        const {post, studyId} = this.props;
        this.postMedia = [];
        if(post.questionMedia && post.questionMedia.length) {
            this.isQuestionMedia = true;
            this.postMedia = this.postMedia.concat(post.questionMedia);
        }
        if(post.media) {
            this.postMedia = this.postMedia.concat(post.media)
        }
        if(this.postMedia.length > 0) {
            this.selectedMedia = this.postMedia[0];
            this.refreshUI();
        }

        await this._controllerPostMedia.getAllTags(studyId);
        this.mediaTags = this._controllerPostMedia.QuestionTags.filter(p=> p.posts.indexOf(post._id)!==-1)
        this.mediaTags = [...this.mediaTags, ...this._controllerPostMedia.StudyTags.filter(p=> p.posts.indexOf(post._id)!==-1)]
        this.refreshUI();
    }

    renderMediaCarousel() {
        const {post} = this.props;
        return (<Carousel showThumbs={false}
            selectedItem={this.selectedMediaIndex}
            onChange={this.handleCarouselChange}
            statusFormatter={this.statusFormatter}
            showArrows={true}
            showStatus={true}
            showIndicators={false} >

              {
                 (this.postMedia && this.postMedia.length) > 0 ? this.postMedia.map((item,index)=>{
                        return(
                            <div className="large-image" key={`file-${index}`}>
                                {
                                     (item.video || item.videoObjectKey) ? <DisplayVideo videoObjectKey={item.videoObjectKey} url={item.video} > </DisplayVideo>
                                     : (item.image || item.imageObjectKey) ? <DisplayImage imageObjectKey={item.imageObjectKey} url={item.image} /> 
                                         :  item.questionnaire  && (item.questionnaire.responses.text === 1 
                                             && item.questionnaire.responses.image === 0 
                                             && item.questionnaire.responses.video === 0
                                             && item.questionnaire.responses.emoticon === 0) 
                                             ? <DisplayImage  url={look_read_only_large}/>
                                             : <DisplayImage url={media_response} />
                                }
                            </div>
                           
                        )
                  })
                  : post.videoUrl ?  <div className="large-image"> <DisplayVideo videoObjectKey={post.videoObjectKey} url={post.videoUrl}> </DisplayVideo> </div>
                  : post.imageUrl 
                    ? <div className="large-image"> <DisplayImage imageObjectKey={post.imageObjectKey} url={post.imageUrl} /> </div>
                    : <div className="large-image">
                        {
                            post.questionnaire && post.questionnaire.responses  && (post.questionnaire.responses.text === 1 
                                && post.questionnaire.responses.image === 0 
                                && post.questionnaire.responses.video === 0
                                && post.questionnaire.responses.emoticon === 0) 
                                ? <DisplayImage url={look_read_only_large}/>
                                : <DisplayImage url={media_response} />
                        }
                    </div>
              }
            

        </Carousel>);
    }

    onMediaDescriptionSave = async (updatedDescription) =>{
        const response = await this._controllerPostMedia.updateMediaDescription(this.selectedMedia._id,updatedDescription);
        if(response && response.body) {
            this.selectedMedia.description = response.body.description;
            this.props.updatedPostMedia(response.body)
        }
    }


    handleTagChange = async (selectedTag)=>{
        this.selectedTag = selectedTag;
        this.refreshUI();
        const tagId = selectedTag.value;
        const {post, studyId} = this.props;
        await this._controllerPostMedia.AddTagToPost(tagId, post._id, studyId);
        this.mediaTags = this._controllerPostMedia.QuestionTags.filter(p=> p.posts.indexOf(post._id)!==-1)
        this.mediaTags = [...this.mediaTags, ...this._controllerPostMedia.StudyTags.filter(p=> p.posts.indexOf(post._id)!==-1)]
        this.selectedTag = null;
        this.refreshUI();
    }

    removeTag = async(tag)=>{
        const {post, studyId} = this.props;
        await this._controllerPostMedia.removeTag(tag._id, post._id, studyId);
        this.mediaTags = this._controllerPostMedia.QuestionTags.filter(p=> p.posts.indexOf(post._id)!==-1)
        this.mediaTags = [...this.mediaTags, ...this._controllerPostMedia.StudyTags.filter(p=> p.posts.indexOf(post._id)!==-1)]
        this.refreshUI();
    }

    onCreateTag = async (tagText) =>{
        const {post, studyId} = this.props;
        await this._controllerPostMedia.createTag(tagText, studyId, post._id);
        this.mediaTags = this._controllerPostMedia.QuestionTags.filter(p=> p.posts.indexOf(post._id)!==-1)
        this.mediaTags = [...this.mediaTags, ...this._controllerPostMedia.StudyTags.filter(p=> p.posts.indexOf(post._id)!==-1)]
        this.refreshUI();
    }

    renderAddTags() {
        return (
            <div className="media-tags">
                {
                    !this.isQuestionMedia && 
                    <div>
                        <div className="title">
                            Add Tags
                        </div>
                        <div>
                            {
                                this.mediaTags.map(tag =>{
                                    return <Tag 
                                            key={tag._id} 
                                            tagOperationAllowed={this.props.tagOperationAllowed}
                                            tagContent={tag} 
                                            removeTag={this.removeTag}
                                            />
                                })
                            }
                        </div>
                        <div className="form-content">
                            {
                                this.props.tagOperationAllowed &&
                                <div>
                                    <span>Search or create</span>
                                    <DropdownCreatable 
                                        selected={this.selectedTag}
                                        createOption={this.onCreateTag}
                                        onChangeHandle={this.handleTagChange}
                                        optionsData={this._controllerPostMedia.getDisplayableTagsForDropDown()} />
                                </div>
                            }
                            <div>
                                <AutoSaveTextArea 
                                    rows={4}
                                    title={"Description"}
                                    editorStyle={{ width: '100%' }}
                                    textValue={this.selectedMedia ? this.selectedMedia.description : ''}
                                    saveData={this.onMediaDescriptionSave} />
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }

    render() {
        return (
            <div className="post-media">
                <div className="media-carousel">
                    { this.renderMediaCarousel() }
                </div>
                <div className="media-content">
                    { this.renderAddTags() }
                </div>
            </div>
        )
    }
}

PostMedia.propTypes = {
    postTags: PropTypes.any,
    post: PropTypes.object,
    studyId: PropTypes.string
}
export default PostMedia;