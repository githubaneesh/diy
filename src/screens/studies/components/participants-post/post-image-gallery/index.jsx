import React, { Component } from 'react';
import { FaArrowsAlt, FaCheckCircle, FaImages, FaCircle } from "react-icons/fa";
import DisplayImage from "../../../../widgets/display-image";
import './style.scss';
import moment from 'moment';
import look_read_only from "../../../../../assets/look_read_only.png";
import media_response_small from "../../../../../assets/media_response_small.png";

class PostImageGallery extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingCardDetails: false,
            selected: props.selectedPostIndex || 0,
            refresh: false
        }
        this.onCardClick = this.onCardClick.bind(this);
    }

    async onCardClick(post, index) {
        this.setState({loadingCardDetails: true});
        await this.props.postClick(post, index)
        this.setState({selected: index, loadingCardDetails: false});
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedPostIndex !== this.props.selectedPostIndex || prevProps.selectedPost !== this.props.selectedPost) {
            this.setState({ selected: this.props.selectedPostIndex , refresh: !this.state.refresh});
        }
    }

    renderImageCards = () => {
        const cards = this.props.posts.map((item, index) => <div className={this.state.selected === index ? "media-card active" : "media-card"} key={`post-card-${item._id ? item._id : index}`}>
                <div className={this.state.loadingCardDetails ? "card-wrapper disabled" : "card-wrapper"} onClick={() => this.onCardClick(item, index)}>
                {
                    item.questionMedia ?
                    <DisplayImage 
                        imageObjectKey={item.questionMedia[0]["imageObjectKey"]}
                        url={item.imageUrl ? item.imageUrl :
                            item.videoThumbnailUrl ? item.videoThumbnailUrl : ""}/>
                    :<DisplayImage checkUpdate={true} 
                    imageObjectKey={(item.media && item.media.length) > 0 ? item.media[0].imageObjectKey:item.imageObjectKey} 
                    url={item.imageUrl ? item.imageUrl :
                    item.videoThumbnailUrl ? item.videoThumbnailUrl :
                        (item.media && item.media.length) > 0 ? item.media[0].image 
                        : (item.questionnaire && (item.questionnaire.responses.text === 1 
                            && item.questionnaire.responses.image === 0 
                            && item.questionnaire.responses.video === 0
                            && item.questionnaire.responses.emoticon === 0) ? look_read_only : media_response_small)} />
                }

                    <div className="card-footer">
                            {
                                // (item.hasOwnProperty("isResolved") && !item.isResolved) 
                                //     && <FaCircle className="unread-notification" size={12} />
                            }
                            {
                                ` ${moment(item.createdAt).format("MMM Do")} at ${moment(item.createdAt).format("h:mm a")}`
                            }
                    </div>
                </div>

                <div className="post-count">
                    <span>{item.tag ? item.tag : index + 1}</span>
                </div>

                {
                    (!!item.mediaLength && item.mediaLength > 1) &&
                    <div className="media-count">
                        <FaImages color={"#ffffff"} size={16} />
                        <span>+{item.mediaLength - 1}</span>
                    </div>
                }
                
                {
                    this.state.selected === index && <div className="open-post">
                        <span onClick={this.props.mediaFullScreen}>
                            <FaArrowsAlt className="open-post-icon" color={"#27a1ef"} size={20} />
                        </span>
                        
                    </div>
                }
                {
                    (item.hasOwnProperty("isResolved") && !item.isResolved) && <div className="post-notification"> 
                        <FaCircle className="unread-notification" size={12} /> 
                    </div>
                }
                {
                    item.isPostResolved && <div className="post-resolved">
                        <FaCheckCircle color={"#27a1ef"} size={18} />
                    </div>
                }
            </div>
        )
        return cards;
    }
    render() {
        return (
            this.renderImageCards()
        );
    }
}

export default PostImageGallery;