import React, { Component } from 'react';
import './style.scss';
import { FaTag } from 'react-icons/fa';
import DropdownCreatable from '../../../../widgets/dropdown-creatable';

class PostCommentTag extends Component {
    _studyId = "";
    _optionsData = [];
    _tagId = '';
    _selectedOption = '';
    constructor(props) {
        super(props);
        this.state = {
            refresh: false,
            isProcessing: false,
        }
    }

    onChangeHandle(e) {
        this._tagId = e.value;
    }

    onAddClickHandler = async () => {
        this.setState({ isProcessing: true });
        await this.props.onAddClickHandler(this._tagId);
    }

    onCreateTag = async (tagText) => {
        this.setState({ isProcessing: true });
        const response = await this.props.onCreateTag(tagText);
        if (response && !response.error) {
            this._tagId = response.data._id;
            this.props.optionsData.forEach(data => {
                if (data.value == response.data._id) {
                    this._tagId = response.data._id;
                    this._selectedOption = data;
                    this.setState({ refresh: !this.state.refresh });
                }
            });
        }
        this.setState({ isProcessing: false });
    }

    render() {
        return (
            <div className="select-post-comment-tag">
                <button className="button icon-tag" onClick={this.props.onCloseHandler}><FaTag/></button>
                <DropdownCreatable 
                    placeholder={""}
                    selected={this._selectedOption}
                    clearable={true}
                    createOption={this.onCreateTag}
                    clearSelectedOption={this.props.clearSelectedOption}
                    onChangeHandle={(selectedOption) => { this.onChangeHandle(selectedOption) }}
                    optionsData={this.props.optionsData} />
                <button disabled={this.state.isProcessing} className="button" onClick={this.onAddClickHandler}>Add</button>
            </div>
        );
    }
}

export default PostCommentTag;