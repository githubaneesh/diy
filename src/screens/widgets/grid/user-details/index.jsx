import React, { Component } from 'react';
import './style.scss';
import DisplayImage from '../../../../screens/widgets/display-image';
import AutoSaveTextArea from '../../auto-save-textarea/index';

class UserDetails extends Component {
    render() {
        return (
            <div className="user-details ">
                <h2 className="capitalize">{this.props.userData.user.firstName} {this.props.userData.user.lastName}</h2>
                <div className="profile">
                    <div>
                        <div className="profile-image">
                            <DisplayImage imageObjectKey={this.props.imageObjectKey} url={this.props.profileImgUrl}></DisplayImage>
                        </div>
                        <div className="profile-details">
                            <span>Group: {this.props.userData.group ? this.props.userData.group.name : ''}</span><br/><br/><br/><br/>
                            <span>Age: {this.props.userData.user.age}</span><br/>
                            <span>Gender: {this.props.userData.user.gender}</span><br/>
                            <span>Location: {this.props.userData.user.fullLocation}</span><br/>
                            <span>Status: {(this.props.userData.status === undefined || this.props.userData.status === null) ? "Neutral" : this.props.userData.status ? "Approved" : "Rejected"}</span>
                        </div>
                        <div className="clear-fix"></div>
                    </div>
                </div>
                <div className="participant-bio">
                    <span>Participant's Bio</span>
                    <div className="participant-bio-inner"></div>
                </div>
                <div className="participant-notes">
                    <AutoSaveTextArea
                        rows={2}
                        title={"Participant's Notes"}
                        textValue = {this.props.userData.user.notes}
                        saveData = {this.props.saveData}>
                    </AutoSaveTextArea>

                </div>                
            </div>
        );
    }
}

export default UserDetails;