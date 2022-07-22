import React, { Component } from 'react';
import './style.scss';
import Utility from '../../../utility/Utility';
import MediaService from '../../../services/mediaservice';


class DisplayVideo extends Component {
    videoUrl = null;
    _mediaService = MediaService.instance;
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: false
        }
        // fallback condition to handle video
        if(!this.props.videoObjectKey) {
            this.videoUrl = this.props.url;
        }
    }
    onLoadHandler=()=> {
        this.setState({loading:false, error: false});
    }
    onErrorHandler=(e)=> {
        this.videoUrl = null;
        this.setState({loading:false, error: true});
    }

    /*async componentWillMount() {
        if(this.props.videoObjectKey) {
            this.videoUrl = await this._mediaService.generateSignedUrl(this.props.imageObjectKey);
            this.setState({loading:false, error: false});
        }
    }*/

    async componentDidMount() {
        if(this.props.videoObjectKey) {
            this.videoUrl = await this._mediaService.generateSignedUrl(this.props.videoObjectKey);
            this.setState({loading:false, error: false});
        }
        if(!Utility.isValidUrl(this.videoUrl) && !this.props.videoObjectKey) {
            this.setState({loading:false, error: true});
        }
    }

    render() {
        return (
            <div className="display-video-container">
            {
                <video src={this.videoUrl} type="video/mp4" autoPlay={false} controls></video>
            }
            </div>
        );
    }
}

export default DisplayVideo;