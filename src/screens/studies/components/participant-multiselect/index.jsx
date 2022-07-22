import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IoIosClose } from "react-icons/io";
import "./style.scss";

class ParticipantMultiSelect  extends Component {

    constructor(props){
        super(props);
        this.removeParticipant = this.removeParticipant.bind(this);
    }

    removeParticipant(participant){
        if( this.props.removeParticipant) {
            this.props.removeParticipant(participant);
        }
    }

    render() {

        const {participants} = this.props;

        return ( <div className="multiselect-container">
                    <ul className="multiselect-options">
                        { 
                            participants.constructor === Array
                            ? participants.map(participant =>{
                                    return ( <li key={participant._id} className="option">
                                                <span className="option-text capitalize">
                                                    {`${participant.user.firstName} ${participant.user.lastName}`} 
                                                    <span className="remove-btn">
                                                        <IoIosClose size={22} onClick={()=>{this.removeParticipant(participant)}}/>
                                                    </span> 
                                                </span>
                                            </li>
                                    )
                                })
                            : <li key={participants._id} className="option">
                                    <span className="option-text capitalize">
                                        {`${participants.user.firstName} ${participants.user.lastName}`} 
                                        <span className="remove-btn">
                                            <IoIosClose size={22} onClick={()=>{this.removeParticipant(participants)}}/>
                                        </span> 
                                    </span>
                                </li>
                            }
                    </ul>
                </div>
        );
    }
}

ParticipantMultiSelect.propTypes = {
    participants: PropTypes.any,
    removeParticipant: PropTypes.func
}

export default ParticipantMultiSelect;