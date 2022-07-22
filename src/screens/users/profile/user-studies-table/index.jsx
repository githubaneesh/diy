
import React, { Component } from 'react';
import './style.scss';
import { FaSort } from 'react-icons/fa';
import UserType from '../../../../common/userType';

class UserStudiesTable extends Component {

    constructor(props){
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <div className="users-study-list">
                {
                    this.props.data.length > 0 && (
                        <table className="user-table">
                            <thead><tr>
                                <th>Study Name</th>
                                <th>Group</th>
                                <th>Number of Posts</th>
                                <th>Active</th>
                                <th>View</th>
                                <th>Edit</th>
                            </tr>
                            </thead>
                            <tbody>
                                {

                                    this.props.data.map((participation,index) => {
                                        return (
                                            <tr key={`user-studies-${index}-${participation._id}`}>
                                                <td className="clickable" onClick={()=>this.props.studyClickHandler(participation)}>
                                                    {participation.study?participation.study.name:"N/A"}
                                                </td>
                                                <td>{participation.group?participation.group.name:"N/A"}</td>
                                                <td>{'2'}</td>
                                                <td>{participation.study? participation.study.isArchived?"Active":"Inactive": "Active"}</td>
                                                {
                                                    this.props.userType.toLowerCase() === UserType.PROSPECT &&
                                                    <td className="clickable" onClick={()=>this.props.viewProfileHandler(participation)}>
                                                        <span>View Profile</span>
                                                    </td>
                                                }
                                                {
                                                    this.props.userType.toLowerCase() === UserType.PROSPECT?
                                                    <td className="hide-profile" onClick={()=>this.props.editClickHandler(participation)}>
                                                        <span>Edit</span>
                                                    </td>
                                                    :<td className="hide-profile" onClick={()=>this.props.removeClickHandler(participation)}>
                                                        <button className="button">Remove</button>
                                                    </td>
                                                }
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    )
                }
            </div>
        );
    }
}

export default UserStudiesTable;