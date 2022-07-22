
import React, { Component } from 'react';
import './style.scss';
import Utility from '../../../../utility/Utility';
import { FaSort } from 'react-icons/fa';
import { Link } from 'react-router-dom';

class UserTable extends Component {

    constructor(props){
        super(props);
        this.state = {
         
            refresh: false
        }
        this.onSort = this.onSort.bind(this);
    }

    getLocation = (City = '', State = '', Country = '') => {

        let stateStr = (State && City !== State) ? `, ${State}` : '';
        let countryStr = Country ? `, ${Country}` : Country;
        let location = '';
        location = `${City}${stateStr}${countryStr}`;
        return location;
    }

    onSort(key){
        this.props.sortData(key);
        this.setState({refresh: !this.state.refresh});
    }

    componentDidUpdate(prevProps) {
        if (this.props !== prevProps) {
            // this.props.sortData();
            // this.setState({ refresh: !this.state.refresh });
        }
    }

    render() {
        return (
            <div className="users-list">
                {
                    <table className="user-table">
                            <thead><tr>
                            <th><span onClick={() => this.onSort('firstName')}>Name <FaSort /></span></th>
                            <th><span onClick={() => this.onSort('email')}>Email Address <FaSort /></span></th>
                            <th><span onClick={() => this.onSort('userType')}>User Type <FaSort /></span></th>
                            <th><span onClick={() => this.onSort('createdAt')}>Account Created <FaSort /></span> </th>
                                <th>View Profile</th>
                                <th>Toggle Status</th>
                                <th>Location</th>
                            </tr>
                            </thead>
                            <tbody>
                                {
                                     this.props.data.length > 0 ? this.props.data.map((user,index) => {
                                        return (
                                            <tr key={`user-${index}-${user._id}`}>
                                                <td>
                                                    <Link className="clickable capitalize" to={`/users/${user._id}`} onClick={()=>this.props.viewProfileHandler(user)}> {user.firstName} {user.lastName} </Link>
                                                </td>
                                                <td>{user.email}</td>
                                                <td>{user.userType}</td>
                                                <td>{Utility.convertToDateString(user.createdAt)}</td>
                                                <td>
                                                   <Link className="clickable" to={`/users/${user._id}`} onClick={()=>this.props.viewProfileHandler(user)}><span>View Profile</span></Link> 
                                                </td>
                                                {
                                                    user.isHidden ? <td className="Unhide-profile" onClick={()=>this.props.unHideUser(user)}>
                                                                        <span>Unhide</span>
                                                                    </td>
                                                                  : <td className="hide-profile" onClick={()=>this.props.hideUser(user)}>
                                                                        <span>Hide</span>
                                                                    </td>
                                                }
                                                
                                                <td>
                                                    <span className="capitalize">{this.getLocation(user.city, user.state, user.country)}</span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                    : <tr>
                                        <td colSpan={7}></td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                }
            </div>
        );
    }
}

export default UserTable;