import React, { Component } from 'react';
import './style.scss';
import videoIcon from '../../../../../../../../assets/icon-video.png';
import imageIcon from '../../../../../../../../assets/icon-image.png';
import textIcon from '../../../../../../../../assets/icon-text.png';
import emojiIcon from '../../../../../../../../assets/icon-emojis.png';
import { FaRegPlayCircle, FaRegImage, FaRegCommentDots, FaRegSmile, FaLanguage } from "react-icons/fa";
import { MdRadioButtonChecked } from "react-icons/md";
import QuestionnaireController from "../questions";
import Loader from '../../../../../../../widgets/loader';
import Upload from '../../../../../../../widgets/upload/index';
import Media from '../../../../../../../widgets/media/index';
//TODO: use question component instead this
class AddQuestion extends Component{
  
    responceTypes =[
        {type:"video", value:0},
        {type: "image", value:0},
        {type: "text", value:0},
        {type: "emoticon", value:0},
        {type: "screenRecording", value: 0}
      ]
      _controller;
    constructor(props){
        super(props);
        this.state = {
            value: 'null',
            responseSelected: false,
            previewMediaUrl: '',
            isFetching: false,
            mediaUpload: false,
            refresh: false
        }
        this._selectedFile = [];
        this.filesBlob = [];
        this._controller = new QuestionnaireController(this);
        this.saveClick = this.saveClick.bind(this);
        this.addCloseClick = this.addCloseClick.bind(this);
    }

    addCloseClick() {
      this.responceTypes.map((item)=> {
          item.value = 0;
          return item;
      });
      this.setState({
          responseSelected: false,
          isFetching: false,
          value: 'null',
          previewMediaUrl: ''
      });
      this._selectedFile = [];
      this.filesBlob = [];
      this.props.onAddQuestionClose();
  }

  async saveClick(){
     this.setState({isFetching: true});
     let extras = {}
     if (this.props.selectedTranscribeLanguage) {
        extras['transcribeLanguage'] = this.props.selectedTranscribeLanguage
     }
     await this._controller.onUpdateQuestionClick(this.props.questionData, this.props.topicId, this.state.value, this.selectedResponces, this.props.nextQuestionId, this._selectedFile, extras);
     this.setState({isFetching: false, mediaUpload: false});
    
     this.addCloseClick();
  }

  onChangeHandler=(file)=>{

      if(!this._selectedFile){
            this._selectedFile = [];
      }
      if(!this.filesBlob){
          this.filesBlob = [];
      }
      let mediaFile = {}
      mediaFile.name = file.name

      if(file.type.startsWith("video",0)){
            mediaFile["video"] = file;
      }
      else if(file.type.startsWith("image",0)){
            mediaFile["image"] = file;
      }

      this._selectedFile.push(mediaFile);
        
      var reader = new FileReader();
        
      reader.onload = function(e) {
            
        let fileData = {};
        fileData["uploaded"] = true;
        fileData["name"] = file.name;
        if(mediaFile["image"]){
            fileData["image"] = e.target.result
        }
        else if( mediaFile["video"]){
          fileData["video"] = e.target.result;
          var video = document.createElement("video");
          video.src = e.target.result;
          video.name = file.name
          video.addEventListener("loadedmetadata",()=>{
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            // Set canvas dimensions same as video dimensions
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Set video current time to get some random image
            video.currentTime = 0.5;
            // Draw the base-64 encoded image data when the time updates
            video.addEventListener("timeupdate", function() {
              context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
              var dataURI = canvas.toDataURL('image/png');
              fileData["image"] = dataURI;
              if(this._selectedFile.length === 1 && fileData["video"]){
                this.setState({previewMediaUrl: fileData["image"]})
              }
              var blobBin = atob(dataURI.split(',')[1]);
              var array = [];
              for(var i = 0; i < blobBin.length; i++) {
                  array.push(blobBin.charCodeAt(i));
              }
              var videoThumbnail=new Blob([new Uint8Array(array)], {type: 'image/png'});
                
              let videoIndex = this._selectedFile.findIndex(f=>f.name === video.name);
              if(videoIndex !== -1){
                this._selectedFile[videoIndex].image = videoThumbnail;
                this._selectedFile[videoIndex].image.name = video.name.split('.')[0] + '.png';
                this.setState({ isDirty: true, mediaUpload: true}) 
              }
              
            }.bind(this))

          })
        }

        this.filesBlob.push(fileData);
        this.setState({ isDirty: true, mediaUpload: true}) 
        if(this.state.previewMediaUrl === ''){
          this.setState({previewMediaUrl: e.target.result})
        }
       
      }.bind(this);

      let lastUploadedFileIndex = this._selectedFile.length > 0 ? this._selectedFile.length - 1 : 0;

      if(file.type.startsWith("video",0)){
        reader.readAsDataURL(this._selectedFile[lastUploadedFileIndex].video);
      }

      else if(file.type.startsWith("image",0)){
        reader.readAsDataURL(this._selectedFile[lastUploadedFileIndex].image);
      }
  }
  responseSelectHandler(responseType) {
    this.responceTypes.forEach((item, index) => {
      if (item.type === responseType) {
        item.value = item.value === 0 ? 1 : 0;
      }
    });

    this.setState({ responseSelected: !this.state.responseSelected});
  }
    render(){ 
        return( 
           this.props.nextQuestionId
            ? this.getQuestionRow()
            : null        
        )
    }

    handleChange(e) {
        this.setState({ value:e.currentTarget.value});
    }


    get selectedResponces() {
        const responce = {};
        // this.responceTypes.filter((item)=> item.value == 1).map((item)=> item.type);
        this.responceTypes.map((item) => {
          if(item.value == 1) {
            responce[item.type]= 1;
          }
        })
        return responce;
    }
    handleDeleteImage=(index, isUploaded)=> {

      this._selectedFile.splice(index, 1);
      this.filesBlob.splice(index, 1);
      
      if(this.filesBlob.length === 0){
        this.setState({ previewMediaUrl: ''})
      }
      
      if((index === 0 && this.filesBlob.length > 0)){
        let blobData = this.filesBlob[0].image;
        this.setState({ previewMediaUrl: blobData},()=>{
          this.setState({refresh: !this.state.refresh});
        })
      }
      else {
        this.setState({refresh: !this.state.refresh});
      }
     
    }

    hideShowTranscribeIcon = (type) =>{
      let selectedResponses = this.responceTypes.filter((responses) => (responses.type === type && responses.value === 1));
      return selectedResponses.length > 0;
    }

    getQuestionRow()
    {
      const showVideoTranscribeLanguageIcon = this.hideShowTranscribeIcon("video");
      const showTranscribeLanguageIcon = this.hideShowTranscribeIcon("screenRecording");
      return (
        <tr className="add-question-panel">
          <td> {this.props.nextQuestionId} </td>
          <td>
            {
              <textarea
                placeholder="Enter text here"
                onChange={e => {
                  this.handleChange(e);
                }}
              ></textarea>
            }
          </td>
          <td>
            {
              <div className="upload-btn-wrapper">
                <Media Uploaded={this.state.mediaUpload} filesData={this.filesBlob} edit={true} url={this.state.previewMediaUrl} handleDelete={this.handleDeleteImage}></Media>
                  <Upload 
                  onChangeHandler={this.onChangeHandler}
                  type="image/png,image/jpeg,video/mp4,video/ogg,video/webm"
                  iconType="image"
                  multiple={true}
                  label="Upload">
                </Upload>
              </div>
            }
          </td>

          <td className="response_options_row">
            {
              <div>
                <ul className="response_list">
                  {this.responceTypes.map((response, index) => {
                    return (
                      <li key={index}>
                        {response.type === "video" && (
                          <div className="video-response">
                            <span className={response.value ? "res-active" : "res-disabled"}
                              onClick={() => {this.responseSelectHandler(response.type)}}>
                              <FaRegPlayCircle color={response.value === 1 ? "#27a1ef" : ""} size={32} />
                            </span>
                            {
                              (showVideoTranscribeLanguageIcon)
                                && <span className="lang-icon" onClick={()=>{this.props.showTranscribePopup("addQuestion", this.props.selectedTranscribeLanguage)}}>
                                  <FaLanguage color={"#27a1ef"} size={25} />
                                </span>
                            }
                          </div>
                        )}
                        {response.type === "image" && (
                          <span
                            className={
                              response.value ? "res-active" : "res-disabled"
                            }
                            onClick={() => {
                              this.responseSelectHandler(response.type);
                            }} >
                            <FaRegImage
                              color={response.value === 1 ? "#27a1ef" : ""}
                              size={32}
                            />
                          </span>
                        )}
                        {response.type === "text" && (
                          <span
                            className={
                              response.value ? "res-active" : "res-disabled"
                            }
                            onClick={() => {
                              this.responseSelectHandler(response.type);
                            }} >
                            <FaRegCommentDots
                              color={response.value === 1 ? "#27a1ef" : ""}
                              size={32}
                            />
                          </span>
                        )}
                        {response.type === "emoticon" && (
                          <span
                            className={
                              response.value ? "res-active" : "res-disabled"
                            }
                            onClick={() => {
                              this.responseSelectHandler(response.type);
                            }} >
                            <FaRegSmile
                              color={response.value === 1 ? "#27a1ef" : ""}
                              size={32}
                            />
                          </span>
                        )}
                        {
                          response.type === "screenRecording" && (
                            <div className="screenRecording-response">
                                <span className={ response.value ? "res-active" : "res-disabled"}
                                onClick={() => {this.responseSelectHandler(response.type); }}>
                                    <MdRadioButtonChecked color={response.value === 1 ? "#27a1ef" : ""} size={35}/>
                                </span>
                                {
                                  (showTranscribeLanguageIcon) &&
                                    <span className="lang-icon" onClick={()=>{this.props.showTranscribePopup("addQuestion",this.props.selectedTranscribeLanguage)}}>
                                        <FaLanguage color={"#27a1ef"} size={25} />
                                    </span>
                                }
                            </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            }
          </td>
          <td>
            {
              this.state.isFetching?
              <Loader/>:
              <div>
                <button className="button"
                disabled={  this.state.value === 'null' || String(this.state.value).trim() === ''}
                  onClick={this.saveClick}>
                  Save
                </button>
                <button className="button space-left"
                  onClick={() => this.addCloseClick()}>
                  <span>Close</span>
                </button>
              </div>
            }
          </td>
          <td></td>{/*  dont remove: blank td added for alignment */}
        </tr>
      );
    }
}

export default AddQuestion;