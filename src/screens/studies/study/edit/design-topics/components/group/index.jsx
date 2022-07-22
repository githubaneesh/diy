import React, { Component } from 'react';
import './style.scss';
import { FaUsers } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

class Group extends Component {
    constructor() {
        super();

        this.state = {
            active: true
        }
    }

    toggleGropDetails() {
        this.setState({active: !this.state.active});
    }

    render(){
        const {groupData} = this.props;
        return(
            <div className="group-details-component">
                <span className="heading" onClick={()=>this.toggleGropDetails()}>
                    <span className="space-right">
                    {this.state.active ? (<FaChevronUp size={18} />) : (<FaChevronDown size={18} />)}
                    </span>
                    <span>{groupData.name} Specs</span>
                </span>
                <div className={this.state.active? "group-details-container-inner" : "group-details-container-inner collapse"}>
                    <div className="group">
                    { 
                       (groupData.criteria && groupData.criteria.groupSize.value) && <span className="fauser"><FaUsers size={30} /> </span> 
                    }
                    {
                        // <span className="space-left"> {groupData.participants} </span>
                        (groupData.criteria && groupData.criteria.groupSize.value) && <span className="group-size"> {groupData.criteria.groupSize.value} </span>
                    }
                        
                        
                    </div>
                    {
                        groupData.criteria && <div className="user-details">
                        {
                            groupData.criteria.ageRange.value && <div>
                                <span>Age Range: </span>
                                <span> {groupData.criteria.ageRange.value} </span>
                            </div>
                        }
                        {
                            groupData.criteria.geography.value && <div>
                                <span>Geography: </span>
                                <span> {groupData.criteria.geography.value} </span>
                            </div>
                        }
                        {
                            groupData.criteria.gender.value && <div>
                                <span>Gender: </span>
                                <span> {groupData.criteria.gender.value } </span>
                            </div> 
                        }
                    </div>
                    }
                    <div>
                        {
                        (groupData.criteria && groupData.criteria.behavior.value) && <div className="user-details">
                            <div>
                                <span>Behavioral Criteria: </span>
                                <span> {groupData.criteria.behavior.value} </span>
                            </div>
                        </div>
                        }
                    </div>
                    <div>
                        <div className="notes">
                            <span className="heading">Notes: </span>
                            <span>{groupData.notes} </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default Group;