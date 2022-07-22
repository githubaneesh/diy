import React, { Component } from 'react';
import { FaTimes } from "react-icons/fa";
import "./style.scss";

class Tag extends Component {

    render() {
        return (
            <div className={this.props.activeClass?this.props.activeClass:"selected-tag"} >
                <button className="name" onClick={()=>this.props.tagClikHandler && this.props.tagClikHandler(this.props.tagContent.tagId, this.props.tagContent.texts)}>
                    {this.props.tagContent.tag || this.props.tagContent.name}
                </button>
                {
                    this.props.tagToPost && this.props.tagOperationAllowed &&
                    (this.props.isTagged ?
                        <button className="tag-remove-post" onClick={()=>this.props.removeTaggedPost(this.props.tagContent.tagId)}>
                            <img src={require("../../../../../assets/un-link.png")}/>
                        </button>
                        :<button className="tag-add-post" onClick={()=>this.props.tagToPost(this.props.tagContent.tagId)}>
                            <img src={require("../../../../../assets/link.png")}/>
                        </button>)
                }
                {
                    this.props.tagOperationAllowed &&
                    <button className="closeIcon" onClick={()=>this.props.removeTag(this.props.tagContent.tagId || this.props.tagContent)}><FaTimes/></button>
                }
            </div>
        );
    }
}

export default Tag;