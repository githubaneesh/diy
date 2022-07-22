import React, { Component } from 'react';
import { FaSort, FaCheck, FaTimes } from "react-icons/fa";
import './style.scss';
import DialogModal from '../dialog-modal/index';
import NotifierService from '../../../services/notifierService';
import Messages from '../../../utility/Messages';
import MediaService from '../../../services/mediaservice';
import UserDetails from './user-details/index';

class Grid extends Component {
    _notifierService = NotifierService.instance;
    _mediaService = MediaService.instance;

    gridData = [];
    selectedProfile={ user :{name:'', age:'', location:''}, group: {}}
    profileImgUrl="";
    imageObjectKey=null;

    constructor() {
        super();
        this.state = {
            sorted: false,
            showProfile: false,
            refresh: false
        };
    }

    sortBy(key) {
        if(this.state.sorted) {
            this.sortDescending(key);
        } else {
            this.sortAscending(key);
        }
    }

    sortAscending(key) {
        this.gridData = this.gridData.sort((a, b) => (a.user[key] > b.user[key]) ? 1 : -1);
        this.setState({sorted: !this.state.sorted});
        
    }

    sortDescending(key) {
        this.gridData = this.gridData.sort((a, b) => (a.user[key] > b.user[key]) ? -1 : 1);
        this.setState({sorted: !this.state.sorted});
    }

    async rowClickHandler(row) {
        console.log(row);
        this.selectedProfile = row;
        this.setState({showProfile: true });

        // get profile image
        const responce = await this._mediaService.getUserProfilePicture(row.user._id);
        this.profileImgUrl = responce.profileImage;
        this.imageObjectKey = responce.imageObjectKey?responce.imageObjectKey:null;
    }

    closeModal = () => {
        this.setState({showProfile: false});
    }

    saveNotes = (e) =>{
        console.log("saveNotes : ",e)
    }

    handleStatusChange = async(row) =>{
        row.status = !row.status;
        row.acceptStatus = row.status;
        row.rejectStatus = !row.acceptStatus;
        this.setState({refresh: !this.state.refresh});

        await this.props.updateParticipantStatus(row._id, row.status);   
    }

    componentDidMount() {
        this.gridData = [...this.props.data];
        this.setState({sorted: false});
    }

    render() {
        return (
            <div className="participants-list">
                {
                    this.gridData.length > 0 
                    ? <table className="participant-table">
                        <thead><tr>
                                <th>Name <button onClick={()=>this.sortBy('name')}><FaSort/></button></th>
                                <th>Age <button onClick={()=>this.sortBy('age')}><FaSort/></button></th>
                                <th>Gender <button onClick={()=>this.sortBy('genderVal')}><FaSort/></button></th>
                                <th>Location <button onClick={()=>this.sortBy('location')}><FaSort/></button></th>
                                <th>Add Notes:</th>
                                <th>Group</th>
                                <th>Status</th>
                                </tr>
                        </thead>
                        <tbody>
                        {
                            this.gridData.map((row, rowIndex)=> {
                                    return <tr key={`row${rowIndex}`}>
                                        <td onClick={()=>this.rowClickHandler(row)}>{row.user.name}</td>
                                        <td>{row.user.age}</td>
                                        <td>{row.user.genderVal}</td>
                                        <td>{row.user.location} </td>
                                        <td>{row.notes}</td>
                                        <td>{row.group ? row.group.position : ''}</td>
                                        <td className="status">
                                            <span>{row.status}</span>
                                            <button onClick={()=>this.handleStatusChange(row)}>
                                                {
                                                    row.acceptStatus ? <FaCheck className="status-approved"/>
                                                    :row.rejectStatus ? <FaTimes className="status-denied" /> : ''
                                                }
                                            </button>
                                        </td>
                                    </tr>
                            })
                        }
                        </tbody>
                    </table>
                : <div className="participant-nodata"> <span>No participants present for this study.</span> </div>   
                }
                
                <DialogModal
                    showModal={this.state.showProfile}
                    modalCloseHandler={this.closeModal}> 
                    <UserDetails userData={this.selectedProfile}
                        imageObjectKey={this.imageObjectKey}
                        profileImgUrl={this.profileImgUrl}
                        saveData={this.saveNotes}>
                    </UserDetails>
                </DialogModal>
            </div>
        );
    }
}

export default Grid;