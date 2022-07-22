import React, { Component } from 'react';
import "./style.scss"
import Group from './group';

class GroupsList extends Component {
    
    render() {
        const {groups} = this.props;
        return (
            <div className="groups">
                <div className="title">Groups ({groups.length})</div>
                {/* should recieve array as props then loop it using map */}
                {
                    groups && groups.length > 0 
                    && groups.map(group => 
                        <Group 
                            key={group._id} 
                            name={group.name} 
                            participants={group.participants} 
                            onClick={()=>{this.props.groupItemClick(group)}}></Group>
                    )
                }
            </div>
        );
    }
}

export default GroupsList;