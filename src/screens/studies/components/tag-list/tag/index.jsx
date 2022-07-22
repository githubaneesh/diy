import React, { Component } from 'react';
import { FaPen, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

import "./style.scss";
import DialogModal from '../../../../widgets/dialog-modal';

class Tag extends Component {

    _tagData = [];
    _inputValue = "";

    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            showDeletePopup: false,
        }
        this._tagData = props.tagData;
    }

    editClickHandler=()=> {
        this.setState({edit: true});
    }

    saveClickHandler = async () => {
        if (this._inputValue) {
            this._tagData.name = this._inputValue;
            await this.props.tagSaveClickHandler(this._tagData);
            this._inputValue = "";
        }
        this.setState({edit: false});
    }

    handleDelete=()=> {
        this.props.tagDeleteClickHandler(this._tagData);
        this.closeDeletePopupModal();
        this.setState({edit: false});
    }

    handleCancel=()=> {
        this.setState({edit: false});
    }

    inputChangeHandler=(e)=> {
        if (e.target.value) {
            this._inputValue = e.target.value;
        }
    }

    showDeletePopupModal = () => {
        this.setState({showDeletePopup: true});
    }

    closeDeletePopupModal = () => {
        this.setState({showDeletePopup: false});
    }

    deletePopup() {
        return (
            <div >
                <DialogModal className="delete-post-modal" showModal={this.state.showDeletePopup} modalCloseHandler={this.closeDeletePopupModal} >
                    <div class="modal-header"><h3>Delete</h3></div>
                    <div className="modal-body">
                        <p>This is permanent and can't be undone! Your data related to this tag will be lost permanently.</p>
                    </div>
                    <div className="modal-footer text-right">
                        <div className="button-group">
                            <button className="button cancel" onClick={this.closeDeletePopupModal}>Cancel</button>
                            <button className="button remove" onClick={this.handleDelete}> Remove</button>
                        </div>                        
                    </div>
                </DialogModal>
            </div>
        )
    }

    render() {
        const {editDelete} = this.props;
        return (
            <div className="tag">
                {
                    this.state.edit?
                    <div className="tag-edit">
                        <input type="text" defaultValue={this._tagData.name} onChange={this.inputChangeHandler}/>
                        <button onClick={this.saveClickHandler}><FaCheck/></button>
                        <button onClick={this.handleCancel}><FaTimes/></button>
                        <button className="delete" onClick={this.showDeletePopupModal}><FaTrash/></button>
                    </div>
                    :<div className="tag-inner">{this._tagData.name} 
                    {
                        (editDelete === undefined || editDelete) && (<button onClick={this.editClickHandler}><FaPen/></button>)
                    }
                    
                    </div>
                }
                { this.deletePopup() }
            </div>
        );
    }
}

export default Tag;