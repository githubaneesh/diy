import React, { Component } from 'react';
import "./style.scss";
import Tag from './tag';

class TagList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tags: props.tags || []
        };
    }

    removeTag = (tagData) => {
        this.props.tagDeleteClickHandler(tagData);
        this.setState(prevState => ({
            tags: prevState.tags.filter(tag => tag._id != tagData._id)
        }));
    }

    render() {
        const { tagSaveClickHandler } = this.props;
        return (
            <div className="tags">
                <div className="title">Tags ({this.state.tags.length})</div>
                {/* should recieve array as props then loop it using map */}
                {
                    this.state.tags && this.state.tags.length > 0
                    && this.state.tags.map(
                        (tag, index) => 
                            <Tag 
                                key={tag._id}
                                editDelete={this.props.editDelete}
                                tagData={tag}
                                tagSaveClickHandler={tagSaveClickHandler}
                                tagDeleteClickHandler={this.removeTag}></Tag>
                    )
                }
            </div>
        );
    }
}

export default TagList;