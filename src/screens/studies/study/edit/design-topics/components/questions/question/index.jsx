import React, { Component } from 'react';
import './style.scss';
import Dropdown from '../../../../../../../widgets/dropdown/index';
import Move from '../../../../../../../widgets/move';
import videoIcon from '../../../../../../../../assets/icon-video.png';
import imageIcon from '../../../../../../../../assets/icon-image.png';
import textIcon from '../../../../../../../../assets/icon-text.png';
import emojiIcon from '../../../../../../../../assets/icon-emojis.png';
import QuestionsController from "../questions";
import { FaRegPlayCircle,
    FaRegImage,FaRegCommentDots,FaRegSmile,FaFileImage,
    FaLanguage,
    FaSave, FaRegTrashAlt, FaTimes, FaPencilAlt } from "react-icons/fa";
import { MdRadioButtonChecked } from "react-icons/md";
import Settings from '../../../../../../../../config/settings'
import Loader from '../../../../../../../widgets/loader';
import Media from '../../../../../../../widgets/media/index';
import MediaService from "../../../../../../../../services/mediaservice";
import NotifierService from '../../../../../../../../services/notifierService';
import QuestionaireService from '../../../../../../../../services/questionaireService';
import Upload from '../../../../../../../widgets/upload/index';
import Utility from '../../../../../../../../utility/Utility';
import { Messages } from '../../../../../../../../utility/Messages';
import autosize from 'autosize';

class Question extends Component {
    _notifierService = NotifierService.instance;
    _mediaService = MediaService.instance;
    _questionaireService = QuestionaireService.instance;

    responceTypes =[
        {type:"video", value:0},
        {type: "image", value:0},
        {type: "text", value:0},
        {type: "emoticon", value:0},
        {type: "screenRecording", value: 0}
      ]
    _selectedFile;
    _controller;
    imageUrl;
    imageObjectKey;
    
    constructor(props){
        super(props);
        this.state = {
            isEdit : false,
            questionId: '',
            value: 'null',
            isDirty: false,
            responseSelected: false,
            isFetching: false,
            questionaireUpdate: false,
            mediaUpload: false
        }

        this.imageObjectKey = this.props.questionData.attachment && this.props.questionData.attachment[0]?this.props.questionData.attachment[0].imageObjectKey : null;
        this.imageUrl = this.getImageUrl(this.props.questionData);
        this._selectedFile = Object.assign([], this.getImageUrl(this.props.questionData)) ;
        this.filesBlob = Object.assign([], this.getImageUrl(this.props.questionData));
        this._controller = new QuestionsController(this)
        this.saveClick = this.saveClick.bind(this);
        this.onUpArrowClick = this.onUpArrowClick.bind(this);
        this.onDownArrowClick = this.onDownArrowClick.bind(this);
    }

    componentDidMount () {
        this.responceTypes.map((item)=> {
            item.value = this.props.questionData.responses[item.type] || 0;
        });
        this.setState({ value:this.props.questionData.task});
    }

    componentDidUpdate(prevProps){
        if(this.props.questionData !== prevProps.questionData){
            this.imageUrl = this.getImageUrl(this.props.questionData);
            this._selectedFile = Object.assign([], this.getImageUrl(this.props.questionData)) ;
            this.filesBlob = Object.assign([], this.getImageUrl(this.props.questionData));
        }
    }

    handleChange(e) {
        const stateObj = {
            value:e.currentTarget.value
        }
        if (!this.state.isDirty) {
            stateObj["isDirty"] = true
        }
        this.setState(stateObj);
    }

    handleDropdownChange=(group) => {
        this.props.copyQuestionToHandler(group, this.props.questionData)
    }

    editClickHandler(questionId){
        this.setState({
            isEdit: true,
            isDirty: false,
            questionId: questionId
          });
          setTimeout(() => {
            if(this.textarea) {
            this.textarea.focus();
            autosize(this.textarea);
            }
          }, 100);

    }

    editCloseClick(){

        this._selectedFile = Object.assign([], this.getImageUrl(this.props.questionData)) ;
        this.filesBlob = Object.assign([], this.getImageUrl(this.props.questionData));
        
        this.setState({
            isEdit: false,
            questionId: '',
            value:this.props.questionData.task
          });
        this.responceTypes.map((item)=> {
            item.value = this.props.questionData.responses[item.type] || 0;
        });
        this.props.editClose(this.props.questionData._id)
    }

    editTranscribe = (showPopup = true) => {
        this.setState({
            isDirty: true
        });
        let selectedTranscribe = this.props.questionData.transcribeLanguage;
        let questionId = this.props.questionData._id;
          if(showPopup){
            this.props.showTranscribePopup("editQuestion", selectedTranscribe, questionId);
        }
    }

    responseSelectHandler(responseType) {
        let videoResponses = [];
        if (responseType === "screenRecording" || responseType === "video") {
          videoResponses = this.responceTypes.filter((responses => ((responses.type === responseType) && responses.value === 0)))
        }
        this.responceTypes.forEach((item, index)=> {
            if(item.type === responseType) {
                item.value = item.value === 0 ? 1: 0;
            }
        });
    
        this.setState({
            responseSelected: !this.state.responseSelected,
            isDirty: true
        }, ()=>{
            if(videoResponses.length > 0) {
                this.editTranscribe(false);
            }
        });
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

    onChangeHandler=(file)=>{
    
    if(!this._selectedFile){
          this._selectedFile = [];
    }
    if(!this.filesBlob){
        this.filesBlob = [];
    }
    let mediaFile = {}
    mediaFile.name = file.name;

    mediaFile["uploaded"] = true;

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
          // Set video current time to get image
          video.currentTime = 0.5;

          // Draw the base-64 encoded image data when the time updates
          video.addEventListener("timeupdate", function() {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                var dataURI = canvas.toDataURL('image/png');
                fileData["image"] = dataURI;
                var blobBin = atob(dataURI.split(',')[1]);
                var array = [];
                for(var i = 0; i < blobBin.length; i++) {
                    array.push(blobBin.charCodeAt(i));
                }
                var videoThumbnail = new Blob([new Uint8Array(array)], {type: 'image/png'});
                
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
    }.bind(this);

    let lastUploadedFileIndex = this._selectedFile.length > 0 ? this._selectedFile.length - 1 : 0;

      if(file.type.startsWith("video",0)){
        reader.readAsDataURL(this._selectedFile[lastUploadedFileIndex].video);
      }
      else if(file.type.startsWith("image",0)){
        reader.readAsDataURL(this._selectedFile[lastUploadedFileIndex].image);
      }

    }

    async saveClick(){
        this.setState({ isFetching: true});

        // update question
        const mediaFilesAdded = this._selectedFile.filter((media)=> media.uploaded === true);
        let extras = {}
        if (this.props.selectedTranscribeLanguage) {
            extras['transcribeLanguage'] = this.props.selectedTranscribeLanguage
        }

        const responce = await this._controller.onUpdateQuestionClick(this.props.questionData, this.props.topicId, this.state.value, this.selectedResponces, this.props.nextQuestionId, mediaFilesAdded, extras);
        
        this.editCloseClick();
        this.setState({
            isFetching: false,
            questionaireUpdate: !this.state.questionaireUpdate,
            mediaUpload: false
        });
    }

    async deleteMedia() {
        const response = await this._mediaService.deleteMedia(this.props.questionData._id);
        
        if(response.error){
            this._notifierService.showMessage(response, Messages.media_delete_failed);
            this.setState({ isFetching: false});
        }
        if(!response.error) {
            this.props.questionData.media.url = "";
        }        
    }

    render(){ 
        return( 
            this.state.isEdit? this.getEditQuestionRow() : this.getQuestionRow()
        )
    }

    getImageUrl (questionData) {
        // console.log("get image url=== ", questionData)
        /*if(questionData.attachment && questionData.attachment.length > 0){
            questionData.attachment.forEach(media =>{
                if(media["image"] && media["image"].indexOf("looklook-moderator-media") !== -1){
                    let imageFileName = media.image.substring(media.image.lastIndexOf('/') + 1)
                    media.image = Settings.getModeratorS3BucketPath(`${imageFileName}`);
                }
                if(media["video"] && media["video"].indexOf("looklook-moderator-media") != -1){
                    let videoFileName = media.video.substring(media.video.lastIndexOf('/') + 1)
                    media.video = Settings.getModeratorS3BucketPath(`${videoFileName}`);
                }
            })
        }*/
        return questionData.attachment? questionData.attachment: [];
    }

    onUpArrowClick() {
        this.props.moveClickHandler('up')

    }

    onDownArrowClick() {
        this.props.moveClickHandler('down')
    }

    onDeleteMedia=async(index, uploadedMedia)=> {

        if(uploadedMedia){

             let deletedFile = this.filesBlob[index];
        
            this._selectedFile.splice(index, 1);
            this.filesBlob.splice(index, 1);
            
            if(this.filesBlob.length === 0){
                this.imageUrl = "";
            }
            
            this.setState({isDirty: true});
        }

        else {

            let mediaToDelete = this._selectedFile[index];
            const response = await this._controller.deleteQuestionMedia(this.props.questionData._id, mediaToDelete._id)
            if (response && !response.error) {
                await this.props.deleteMedia(this.props.questionData.group[0]._id, this.props.topicIndex, this.props.questionIndex, index)
                this._selectedFile.splice(index, 1);
                this.filesBlob.splice(index, 1);
                this.setState({ isDirty: true });
            }
            
        }

        
    }
    async deleteQuestionHandler() {
        this.props.onDelete(this.props.questionData._id, this.props.questionData.group[0], this.props.questionData);

    }

    getQuestionRow()
    {
        const questionImageUrls = this.getImageUrl(this.props.questionData);
        const previewUrl = questionImageUrls && questionImageUrls.length > 0 ? questionImageUrls[0].image : '';
        const _imageObjectKey = questionImageUrls && questionImageUrls.length > 0 ? questionImageUrls[0].imageObjectKey : null;
        const _videoObjectKey = questionImageUrls && questionImageUrls.length > 0 ? questionImageUrls[0].videoObjectKey : null;
        const { topicSequence, questionSequence } = this.props;

      return(
        <tr className="question" key={this.props.questionData._id}>
               <td>{`${topicSequence}${questionSequence}`}</td>
               <td>{this.props.questionData.task}</td>
              <td><Media imageObjectKey={_imageObjectKey} videoObjectKey={_videoObjectKey} filesData={questionImageUrls} url={previewUrl}></Media></td>

              <td className="response_options_row">
                  {
                        <div>
                         <ul className="response_list">
							 {
								this.responceTypes.map((response, index) => {
									return <li key={index}> 
                                               {
                                                    response.type === "video" && this.props.questionData.responses[response.type] !== 0
                                                        && <div className="video-response">
                                                            <span className='active'>
                                                                <FaRegPlayCircle 
                                                                    color={this.props.questionData.responses[response.type] === 1 ? "#27a1ef" : ""} 
                                                                    size={32}
                                                                /> 
                                                            </span>
                                                            <span className="lang-icon" onClick={()=>{this.props.showTranscribePopup("viewQuestion", this.props.questionData.transcribeLanguage, this.props.questionData._id)}}>
                                                                <FaLanguage color={"#27a1ef"} size={25} />
                                                            </span>
                                                        </div>
                                                }
                                                {
                                                    response.type === "image" && this.props.questionData.responses[response.type] !== 0
                                                        && <span className='active'> 
                                                                <FaRegImage 
                                                                    color={this.props.questionData.responses[response.type] === 1 ? "#27a1ef" : ""} 
                                                                    size={32}
                                                                /> 
                                                            </span>
                                                }
                                                {
                                                    response.type === "text" && this.props.questionData.responses[response.type] !== 0
                                                        && <span className='active'> 
                                                                <FaRegCommentDots 
                                                                    color={this.props.questionData.responses[response.type] === 1 ? "#27a1ef" : ""} 
                                                                    size={32}
                                                                />  
                                                        </span>
                                                }
                                                {
                                                    response.type === "emoticon" && this.props.questionData.responses[response.type] !== 0
                                                        && <span className='active'>
                                                                <FaRegSmile 
                                                                    color={this.props.questionData.responses[response.type] === 1 ? "#27a1ef" : ""} 
                                                                    size={32}
                                                                /> 
                                                            </span>
                                                }
                                                {
                                                    response.type === "screenRecording" && this.props.questionData.responses[response.type]
                                                        && <div className="screenRecording-response">
                                                            <span className='active'>
                                                                <MdRadioButtonChecked 
                                                                    color={this.props.questionData.responses[response.type] === 1 ?"#27a1ef" : ""} 
                                                                    size={35} />
                                                            </span>
                                                            <span className="lang-icon" onClick={()=>{this.props.showTranscribePopup("viewQuestion", this.props.questionData.transcribeLanguage, this.props.questionData._id)}}>
                                                                <FaLanguage color={"#27a1ef"} size={25} />
                                                            </span>
                                                        </div>
                                                }          
										  </li>
								})
							 }
                         </ul>
                      </div>
                  }
              </td>
              <td>
                {
                    <div className="question-action-area">
                        <button 
							className="button" 
							onClick={()=>this.editClickHandler(this.props.questionData._id)}><FaPencilAlt/></button> 
                        <Dropdown 
							defaultOptionText="Copy To Group" 
							optionsData={this.props.groupsdata} 
							onChangeHandle={this.handleDropdownChange}
                            placeholder={"Copy to..."}>
						</Dropdown>
						
                     </div> 
                }
              </td>
               <td>
                    <Move
                        onUpArrowClick = { ((this.props.questionIndex === 0 || this.props.questionIndex === 1) && this.props.topicIndex === 0 ) ? null : this.onUpArrowClick}
                        onDownArrowClick = {(this.props.questionIndex === 0  && this.props.topicIndex === 0 ) ? null : this.onDownArrowClick}>
                    </Move>
               </td>

            </tr>
      );
    }

    hideShowTranscribeIcon = (type) =>{
        let selectedResponses = this.responceTypes.filter((responses) => ((responses.type === type) && responses.value === 1));
        return selectedResponses.length > 0;
    }

    getEditQuestionRow() {
        const { topicSequence, questionSequence } = this.props;
        this.imageUrl = this.filesBlob && this.filesBlob.length > 0 ? this.filesBlob[0].image : '';
        this.imageObjectKey = this.props.questionData.attachment && this.props.questionData.attachment[0]?this.props.questionData.attachment[0].imageObjectKey:"";
        const showVideoTranscribeLanguageIcon = this.hideShowTranscribeIcon("video");
        const showTranscribeLanguageIcon = this.hideShowTranscribeIcon("screenRecording");

      return(
        <tr className="question-edit" key={`edit-${this.props.questionData._id}`}>
               <td>{`${topicSequence}${questionSequence}`}</td>
               <td>
                    <span className="print-only">{this.props.questionData.task}</span>
                   <textarea 
                        className="no-print"
                        ref={c=>this.textarea=c}
                        rows={1}
                        defaultValue={this.props.questionData.task}
                        onChange={(e)=>{this.handleChange(e)}}>
                    </textarea>
                </td>
                <td>
                    <div className="upload-btn-wrapper">
                        {
                            (this.imageUrl || this.imageObjectKey)
                            ? <Media Uploaded={this.state.mediaUpload} 
                                filesData={this.filesBlob} edit={true} url={this.imageUrl} imageObjectKey={this.imageObjectKey} handleDelete={this.onDeleteMedia} imageChangeHandler={this.onChangeHandler} />
                            : <span className="no-media-print-only">
                                <Media filesData={this.filesBlob} url={this.imageUrl} imageObjectKey={this.imageObjectKey} />
                            </span>
                        }
                        <span>
                            <Upload 
                                onChangeHandler={this.onChangeHandler}
                                type="image/png,image/jpeg,video/mp4,video/ogg,video/webm"
                                iconType="image"
                                multiple={true}
                                label="Upload">
                            </Upload>  
                        </span>
                    </div> 
                </td>

              <td className="response_options_row">
                     <div> 
                            <ul className="response_list">
                                {
                                    this.responceTypes.map((response, index) => {
                                        return <li key={index}>   
                                                    {
                                                        response.type === "video" 
                                                            && <div className="video-response">
                                                                <span className={response.value === 0 ? "res-disabled" : 'res-active'}
                                                                                        onClick={() => { 
                                                                                            this.responseSelectHandler(response.type) 
                                                                                        }} > 
                                                                    <FaRegPlayCircle 
                                                                        color={response.value === 1 ? "#27a1ef" : ""} 
                                                                        size={32}
                                                                    /> 
                                                                </span>
                                                                {
                                                                    (showVideoTranscribeLanguageIcon)
                                                                    && <span className="lang-icon" onClick={()=>{this.editTranscribe()}}>
                                                                        <FaLanguage color={"#27a1ef"} size={25} />
                                                                    </span>
                                                                }
                                                            </div>

                                                    }
                                                    {
                                                        response.type === "image" 
                                                            && <span className={response.value === 0 ? "res-disabled" : 'res-active'}
                                                                                        onClick={() => { 
                                                                                            this.responseSelectHandler(response.type) 
                                                                                        }} > 
                                                                            <FaRegImage 
                                                                                color={response.value === 1 ? "#27a1ef" : ""} 
                                                                                size={32}
                                                                            /> 
                                                                </span>
                                                    }
                                                    {
                                                        response.type === "text" 
                                                            && <span className={response.value === 0 ? "res-disabled" : 'res-active'}
                                                                                        onClick={() => { 
                                                                                            this.responseSelectHandler(response.type) 
                                                                                        }} >  
                                                                    <FaRegCommentDots 
                                                                        color={response.value === 1 ? "#27a1ef" : ""} 
                                                                        size={32}
                                                                    />  
                                                                </span>
                                                    }
                                                    {
                                                        response.type === "emoticon" 
                                                            && <span className={response.value === 0 ? "res-disabled" : 'res-active'}
                                                                                            onClick={() => { 
                                                                                                this.responseSelectHandler(response.type) 
                                                                                            }} > 
                                                                    <FaRegSmile 
                                                                        color={response.value === 1 ? "#27a1ef" : ""} 
                                                                        size={32}
                                                                    /> 
                                                              </span>
                                                    }
                                                    {
                                                        response.type === "screenRecording"
                                                        && (<div className="screenRecording-response">
                                                            <span className={response.value === 0 ? "res-disabled" : 'res-active'}
                                                            onClick={() => { this.responseSelectHandler(response.type); }}>
                                                                <MdRadioButtonChecked color={response.value === 1 ? "#27a1ef" : ""} size={35} />
                                                            </span>
                                                            {
                                                                (showTranscribeLanguageIcon) &&
                                                                <span className="lang-icon" onClick={()=>{this.editTranscribe()}}>
                                                                    <FaLanguage color={"#27a1ef"} size={25} />
                                                                </span>
                                                            }
                                                        </div>
                                                        )
                                                    }
                                                </li>
                                    })
                                }
                            </ul>
                    </div>
              </td>
              <td>
                {
                    this.state.isFetching?
                    <Loader/>:
                    <div className="edit-action-aream">
                        <button className="button" 
                        disabled={!this.state.isDirty || !Utility.isValidText(this.state.value)}
                            onClick={this.saveClick}><FaSave/>
                        </button>
                        <button className="button space-left" onClick={()=> this.editCloseClick(this.props.questionData._id)}>
                            <FaTimes/>
						</button>
                        <button className="button space-left delete" onClick={()=> this.deleteQuestionHandler()}>
							<FaRegTrashAlt/>
						</button>                        
					  </div>
                }
              </td>
              <td></td>
            </tr>
      );
    }

}

export default Question;