import React, { Component } from 'react';
import { FaFileImage, FaUpload } from "react-icons/fa";
import NotifierService from '../../../services/notifierService';
import './style.scss';
import { Messages } from '../../../utility/Messages';

class Upload extends Component {

    fileInput = null;
    _notifierService = NotifierService.instance;

    onChangeHandler = async(event)=>{
        let selectedFiles = event.target.files;
        Array.from(selectedFiles).forEach(async(selectedFile)=>{
            const acceptedFiles = this.props.type.split(',');
            if((this.props.type === "") || acceptedFiles.includes(selectedFile.type)){
                await this.props.onChangeHandler(selectedFile);
            }
            else {
                this._notifierService.showMessage({error:true},' ',`${selectedFile.name} has ${Messages.invalid_file}`);

            }
        })
      
        
        if(this.fileInput){
            this.fileInput.value = "";
        }
            
    }

    render() {
        return (
            <div className="upload-btn-wrapper">
                <button className="button no-print">
                    {this.props.iconType==="image"?<FaFileImage/>:<FaUpload/>} <span>{this.props.label}</span></button>
                <input ref={ref=> this.fileInput = ref} type="file" name="file" accept={this.props.type} multiple={this.props.multiple ? this.props.multiple : false} onChange={this.onChangeHandler}/>
            </div> 
        );
    }
}

export default Upload;