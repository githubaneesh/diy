import React, { Component } from 'react';
import { FaFileImage, FaTrashAlt } from "react-icons/fa";
import './style.scss';
import DialogModal from '../dialog-modal/index';
import DisplayImage from '../../../screens/widgets/display-image';
import DisplayVideo from '../../../screens/widgets/display-video';
import Utility from '../../../utility/Utility';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';


class Media extends Component {

    mediaIndex;

    constructor() {
        super();

        this.state = {
            showLargeImage: false,
            showDeletePopup: false,
            refreshCarousel: false
        }
    }
   
    showLargeImage = () => {
        this.setState({
            showLargeImage: true
        });
    }
    closeModal = () => {
        this.setState({showLargeImage: false});
    }
    onChangeHandler=(event)=> {
        this.props.imageChangeHandler(event);
    }
    

    handleDelete= async(index)=> {
        this.mediaIndex = index;
        const {showDeletePopup, filesData, Uploaded} = this.props;
        if(showDeletePopup === undefined || showDeletePopup) {
            this.setState({showDeletePopup: true, refreshCarousel: false})
        }
        else {
            if (this.mediaIndex !== undefined) {
                await this.props.handleDelete(this.mediaIndex, Uploaded);
            }
        }
       
    }

    deleteMedia = async()=>{
        
        if(this.mediaIndex !== undefined){
            await this.props.handleDelete(this.mediaIndex, this.props.Uploaded);
            this.setState({ showLargeImage: false, refreshCarousel: true}, ()=>{
                if(this.props.filesData && this.props.filesData.length === 0){
                    this.setState({showLargeImage: false, showDeletePopup: false});
                }
                else {
                    this.setState({showLargeImage: true, showDeletePopup: false});
                }
            })
            
        }
       
    }

    closeDeletePopup = ()=>{
        this.setState({showDeletePopup: false})
    }

    statusFormatter =(current, total)=>{
        return `${current} / ${total}`;
    }

    render() {
      
        return (
            <div>
                <span className="uploaded-media">
                    {
                        (this.props.url || this.props.imageObjectKey) ?
                            <span className="media-image">
                                <div className="thumbnail" onClick={this.showLargeImage}>
                                    {
                                       
                                        this.props.Uploaded ?
                                            Utility.getBlobDataExtension(this.props.url) === "video" ?
                                                <div className="video-bg">
                                                    <video id="video" src={this.props.url}>
                                                        <source src={this.props.url} />
                                                    </video>
                                                </div>
                                            : <DisplayImage checkUpdate={true} imageObjectKey={this.props.imageObjectKey} url={this.props.url} ></DisplayImage>
                                        : Utility.isVideo(this.props.url) ?
                                            <div className="video-bg">
                                                <DisplayVideo videoObjectKey={this.props.videoObjectKey} url={this.props.url}></DisplayVideo>
                                            </div>
                                         :<DisplayImage checkUpdate={true} imageObjectKey={this.props.imageObjectKey} url={this.props.url} ></DisplayImage>

                                         
                                    }
                                   
                                </div>
                            </span>
                        : <FaFileImage/>
                    }
                </span>

                {/* popup to show large image */}
                <DialogModal className="carousel-media-modal"
                    refresh={this.state.refreshCarousel}
                    showModal={this.state.showLargeImage}
                    modalCloseHandler={this.closeModal}> 
                    {
                         (this.state.showLargeImage) && <Carousel showThumbs={false} statusFormatter={this.statusFormatter} showArrows={true} showStatus={this.props.showStatus!==undefined ? this.props.showStatus : true}  showIndicators={false}>
                          {
                                  (!this.props.filesData) ?
                                      <div className="large-image">
                                          {
                                              (this.props.videoObjectKey || Utility.getBlobDataExtension(this.props.url) === "video") ? 
                                              <DisplayVideo videoObjectKey={this.props.videoObjectKey} url={this.props.url}></DisplayVideo>
                                              : <DisplayImage imageObjectKey={this.props.imageObjectKey} url={this.props.url} ></DisplayImage>
                                          }
                                          {
                                               this.props.edit && <div className="media-edit">
                                                  <button className="delete" onClick={()=>{this.handleDelete(0)}}><FaTrashAlt/></button>
                                              </div>
                                          }
                                      </div>
                                      
                                  : 
                                      this.props.filesData.map((file,index)=>{
                                          return(
                                              <div className="large-image" key={`file-${index}`}>
                                                  {
                                                      (file.videoObjectKey || file.imageObjectKey) 
                                                      ? file.videoObjectKey 
                                                        ? <DisplayVideo videoObjectKey={file.videoObjectKey} url={file.video} /> 
                                                        : <DisplayImage imageObjectKey={file.imageObjectKey} url={file.image} />
                                                      : file.video ? <DisplayVideo url={file.video} /> 
                                                            : <DisplayImage url={file.image} />
                                                  }
  
                                                  {
                                                      this.props.edit && <div className="media-edit">
                                                          <button className="delete" onClick={()=>{this.handleDelete(index)}}><FaTrashAlt/></button>
                                                      </div>
                                                  }
  
                                              </div>
                                          )
                                      })
                          }
                             
                          </Carousel>
                    }
                  
                </DialogModal>

                <div>
                    <DialogModal showModal={this.state.showDeletePopup} modalCloseHandler={this.closeDeletePopup} >
                        <div className="delete-media-modal">
                            <div className="modal-header"><h3>Delete Media</h3></div>
                            <div className="modal-body">
                                <p>Are you sure, you want to delete this media?</p>
                            </div>
                            <div className="modal-footer text-right">
                                <div className="button-group">
                                    <button className="button" onClick={this.closeDeletePopup}> Cancel </button>
                                    <button className="button remove" onClick={()=>{this.deleteMedia()}}> Remove</button>
                                </div>
                            </div>
                        </div>
                    </DialogModal>
                </div>

            </div>
        );
    }
}

export default Media;