import React, { Component } from 'react';
import Loader from '../loader';
import { FaFileImage } from "react-icons/fa";
import './style.scss';
import Utility from '../../../utility/Utility';
import MediaService from '../../../services/mediaservice';

class DisplayImage extends Component {
    imageUrl = null;
    _mediaService = MediaService.instance;
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: false
        }

        // fallback condition to handle image
        if(!this.props.imageObjectKey) {
            this.imageUrl = this.props.url;
        }
    }
    onLoadHandler=()=> {
        this.setState({loading:false, error: false});
    }
    onErrorHandler=(e)=> {
        this.imageUrl = null;
        this.setState({loading:false, error: true});
    }

    async componentDidMount() {
        if(!Utility.isValidUrl(this.imageUrl) && !this.props.imageObjectKey) {
            this.setState({loading:false, error: true});
        }

        if(this.props.imageObjectKey) {
            this.imageUrl = await this._mediaService.generateSignedUrl(this.props.imageObjectKey);
            this.setState({loading:false, error: false});
        }
    }

    async componentDidUpdate() {
        if(this.props.imageObjectKey && this._imageObjectKey !== this.props.imageObjectKey) {
            this.setState({loading:true, error: false});
            this._imageObjectKey = this.props.imageObjectKey;
            this.imageUrl = await this._mediaService.generateSignedUrl(this.props.imageObjectKey);
            this.setState({loading:false, error: false});
        }
        else if(this.props.checkUpdate && this.props.url && !this.props.imageObjectKey && this.imageUrl !== this.props.url) {
            this.imageUrl = this.props.url;
            this.setState({loading:true, error: false});
        }
    }

    render() {
        return (
            <div className="display-image-container">
                {this.state.loading && <Loader className="loader"/>}
                {!this.state.error && <img src={this.imageUrl} onLoad={this.onLoadHandler} onError={this.onErrorHandler}/>}
                {this.state.error && <FaFileImage size={80}/>}      
            </div>
        );
    }
}

export default DisplayImage;