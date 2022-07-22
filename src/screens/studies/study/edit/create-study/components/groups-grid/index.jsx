import React, { Component } from 'react';
import { FaPlus } from "react-icons/fa";
import "./style.scss";
import DialogModal from '../../../../../../widgets/dialog-modal';
import AddGroup from './add-group/index';

class GroupsGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      refresh: false,
      showDeletePopup : false
    };
    this.selectedGroup = {};
    this.modalType = "add";
    this.groupModal = this.groupModal.bind(this);
    this.rowClickHandler = this.rowClickHandler.bind(this);
  }

  rowClickHandler(group){
    this.selectedGroup =  JSON.parse(JSON.stringify(group))
    this.modalType = "edit"
    this.setState({ showModal: true});
  }

  handleAddGroupClick = () => {
    this.setState({ showModal: true });
  };

  closeModal = () => {
    this.setState({showModal: false, refresh: false});
    this.resetModalValues();
  }

  resetModalValues = ()=>{   
    this.selectedGroup = {};
    this.modalType = "add";
  }

  handleSaveGroup= (selectedGroup)=>{
      console.log("selectedGroup : ", selectedGroup);
      this.props.saveGroup(this.modalType, selectedGroup);
      this.closeModal();
  }

  handleDeleteBtnGroup = () =>{
    this.setState({showDeletePopup: true})
  }
  closeDeletePopup = () =>{
    this.setState({showDeletePopup: false});
  }

  deleteGroup = async() =>{
    const response = await this.props.deleteGroup(this.selectedGroup._id);
    if(response && response.body){
      this.closeModal();
      this.setState({showDeletePopup: false});
    }
  }

  groupsTable(groups) {
    return (
      <table className="groups-table">
        <thead>
           <tr>
              <th>Name</th>
              {/* <th>Size</th> */}
              <th>Notes</th>
           </tr>
        </thead>
        <tbody>
           {groups.map((group, index) => {
           return (
                    <tr onClick={()=>this.rowClickHandler(group)} key={`row-${index}`}>
                        <td> {group.name} </td>
                        {/* <td> {group.participants} </td> */}
                        <td>
                          <span className="notes">
                            {group.notes} 
                          </span>
                           
                        </td>
                    </tr>
           );
           })}
        </tbody>
     </table>
    );
  }
 

  groupModal() {
    let modalTitle = this.modalType === "add" ? "Add a Group" : "Edit Group";
  
    return (
        <div className="group-modal">
           <DialogModal
             showModal={this.state.showModal}
             modalCloseHandler={this.closeModal} >
               <AddGroup
                  onSave={this.handleSaveGroup}
                  onDelete={this.handleDeleteBtnGroup}
                  modalType={this.modalType}
                  selectedGroup={this.selectedGroup}>
               </AddGroup>
           </DialogModal>
        </div>
    )
  }

  deletePopup() {
    return (
      <div >
          <DialogModal className="delete-modal" showModal={this.state.showDeletePopup} modalCloseHandler={this.closeDeletePopup} >
            <div className="modal-header"><h3>Delete Group</h3></div>
            <div className="modal-body">
              <p> Are you sure you want to delete this group? <br/> This will remove all users, topics, and questions from the group.</p>
            </div>
            <div className="modal-footer text-right">
              <div className="button-group">
                <button className="button" onClick={this.closeDeletePopup}>Cancel</button>                
                <button className="button remove" onClick={this.deleteGroup}> Remove</button>
              </div>
            </div>
          </DialogModal>
      </div>
    )
  }

  render() {
    const { groupsData } = this.props;
    return (
      <div className="groups-grid">
        <span> Groups </span> 
        <div className="groups-grid-inner">
            {
                groupsData.length > 0 && this.groupsTable(groupsData)
            }
        </div>
        <div>
          <button className="button space-right" onClick={this.handleAddGroupClick}>
            <FaPlus /> <span>Add Group</span>
          </button>
        </div>
        { this.groupModal() }
        { this.deletePopup() }
      </div>
    );
  }
}

export default GroupsGrid;