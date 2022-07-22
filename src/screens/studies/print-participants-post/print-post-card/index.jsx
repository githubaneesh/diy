import React, { Component } from 'react';
import DisplayImage from '../../../widgets/display-image';
import './style.scss';
import Utility from '../../../../utility/Utility';
import moment from 'moment';

class PrintPostCard extends Component {
    render() {
        let { media, comments, translatedComment, user } = this.props;
        return (
            <div className="print-post-card">
                <div className="print-header">
                    <div className="name capitalize">{user.firstName} {user.lastName.substring(0,1)}</div>
                    <div className="details capitalize">
                        <div><span>Gender: </span><span>{user.gender}</span></div>
                        <div><span>Age: </span><span>{Utility.getAge(user.birthdate)} </span></div>
                        <div><span>Location: </span><span>{user.city}, {user.state}, {user.country}</span></div>
                        <div><span>Occupation: </span><span>{ user.occupation ? user.occupation : 'N/A'}</span></div>
                    </div>
                </div>
                <div className="print-post-content">
                    <div className="grid-item left-panel">
                        {
                            media && media.length > 0
                            && media.map(mediaDetail => (
                                <DisplayImage imageObjectKey={mediaDetail.imageObjectKey} key={mediaDetail._id} url={mediaDetail.image} />
                            ))
                        }
                    </div>
                    <div className="grid-item right-panel">
                        {
                            comments && comments.length > 0
                            && comments.map((comment, index) => (
                                <div className="comment-section" key={comment._id}>
                                    <div className="date-and-time">{ moment(comment.createdAt).format('LLLL')}</div>
                                    <div className="participant-name capitalize">{comment.createdBy.firstName}</div>
                                    <div>{comment.text}</div>
                                    <div className="translated-text">{comment.localeComment ? comment.localeComment : ""}</div>
                                </div>
                            ))
                        }
                    </div>
                    <div className="clear-fix"></div>
                </div>
            </div>
        );
    }
}

export default PrintPostCard;