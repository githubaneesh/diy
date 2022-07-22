import React, { Component } from 'react';
import "./style.scss";
import Utility from '../../../../utility/Utility';
import Tag from './tag';
import TagService from '../../../../services/tagService';
import GoogleTranslateService from '../../../../services/googletranslate';
import { FaPencilAlt } from "react-icons/fa";

class SelectTag extends Component {
    layerX;
    layerY;
    selectedText;
    commentText;
    tagList=[];
    highlightedTagId = '';  // track selected tag to set active class or to handle text highlight
    selectRef;
    _tagService = TagService.instance;
    _googleTranslate = GoogleTranslateService.instance;
    mouseDownEvent = null;
    selectedCommentLanguage = "en";

    constructor(props) {
        super(props);
        this.state = {
            refresh: false,
            display: 'none'
        }
        this.selectRef = React.createRef();
        this.commentText = this.props.comment.text;
        this.tagList = this.props.tagList;
        this.addHighlightClass = this.addHighlightClass.bind(this);
    }

    async getSelectedCommentLanguage() {
        // if translated comment element is being tag, allow normal regex search for tag
        if (this.props.localeCommentEl) {
            this.selectedCommentLanguage = "en";
            return;
        }
        const detectResponse = await this._googleTranslate.detectLanguage([this.props.comment.text]);
        if(detectResponse && !detectResponse.error ){
            this.selectedCommentLanguage = detectResponse.body.language
        }
    }

    async componentDidMount() {
        // await this.getSelectedCommentLanguage();
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (prevProps.comment.text !== this.props.comment.text) {
            this.commentText = this.props.comment.text;
            // await this.getSelectedCommentLanguage();
            this.tagList = this.props.tagList;
            this.setState({ refresh: !this.state.refresh });
        }
        if(this.props.tagList && prevProps.tagList && prevProps.tagList.length !== this.props.tagList.length) {
            this.commentText = this.props.comment.text;
            // await this.getSelectedCommentLanguage();
            this.tagList = this.props.tagList;     
            this.removeHighlight();
        }
        if (prevProps.tagList !== this.props.tagList) {
            if (this.props.comment.text !== prevProps.comment.text) {
                this.commentText = this.props.comment.text;
                // await this.getSelectedCommentLanguage();
                this.removeHighlight();
            }
            this.tagList = this.props.tagList;
            this.setState({ refresh: !this.state.refresh });
        }
        if(prevState.display !== this.state.display) {
            if(this.state.display === 'block') {
                document.addEventListener('mousedown', this.handleClickOutside);
            }
            else {
                document.removeEventListener('mousedown', this.handleClickOutside);
            }
        }
    }

    handleOnSelect = (event) => {
        // clear existing selection as we have extracted selected text and will be highlighting based on below condition
        this.clearSelection();
        const isValidText = Utility.isValidText(this.selectedText);
        if(isValidText && this.highlightText()) {
            const dropdownWidth = 600;
            const commentContainer = document.querySelector('.comments-container');
            this.layerX = event.clientX > dropdownWidth? event.clientX-dropdownWidth : this.selectRef.current.offsetLeft;
            // this.layerY = (this.selectRef.current.offsetTop - (commentContainer.scrollTop+50)); // height of dropdown
            if(this.selectRef.current.offsetTop> (commentContainer.scrollTop+50)) {
                this.layerY = (this.selectRef.current.offsetTop - (commentContainer.scrollTop+50)); // height of dropdown
            }
            else {
                this.layerY = 80;
            }
            this.setState({display: 'block'}, ()=> {
                this.props.onSelect(this.layerX, this.layerY, this.selectedText, this.props.comment._id, this.state.display, this.props.localeCommentEl);
            });
        } else {
            this.removeHighlight();
        }
        // remove active class from selected tag if any
        this.highlightedTagId = '';
    }

     removeHighlight=()=> {
        this.commentText = this.props.comment.text;
        this.setState({display: 'none'}, ()=> {
            this.props.onSelect(0, 0,'', '', this.state.display);
        }); 
     }

    handleClickOutside = (event) => {
        const tagSelectContainer = document.querySelector('.tag-select-container');
        if (tagSelectContainer && !tagSelectContainer.contains(event.target)) {
            this.removeHighlight();
        }
    }

    highlightText() {
        let updatedComment = this.addHighlightClass(this.props.comment.text, [this.selectedText], "highlight");
        // if no change in original comment i.e. no match found and hence no highlights then skip processing
        if (updatedComment==this.props.comment.text) {
            return false;
        }
        this.commentText = updatedComment;
        return true;
    }

    addHighlightClass (str, searchTexts, className) {
        searchTexts.forEach(text => {
            text = text.trim();
            console.log("commentLanguage: ", this.props.commentLanguage)
            var pattern = '';
             // if special characters in selected text then allow selected word search
            if (this.hasSpecialChar(text) 
                    || (this.props.commentLanguage && this.props.commentLanguage !== "en")) 
            {
                pattern = new RegExp(this.escapeRegExp(text), "gm");
            } 
            else {
                // else allow complete word search only
                pattern = new RegExp("\\b"+this.escapeRegExp(text)+"\\b", "gm");
            }
            if (pattern.test(str)) {
                str = str.replace(pattern, `<span class="${className}">${text}</span>`);
            }
        });
        return str;
    }

    // escape RegExp special characters and allow multiple spaces or line breaks or tabs between words.
    escapeRegExp(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&').replace(/\s/g, '\s*');
    }

    hasSpecialChar(text) {
        var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return format.test(text);
    }

    getSelectedText() {
        if (window.getSelection) {
            return window.getSelection().toString();
        } else if (document.selection) {
            return document.selection.createRange().text;
        }
        return '';
    }

    clearSelection = () => {
        if (document.getSelection) {
            if (document.getSelection().empty) {  // Chrome
                document.getSelection().empty();
            } else if (document.getSelection().removeAllRanges) {  // Firefox
                document.getSelection().removeAllRanges();
            }
        } else if (document.selection) {  // IE?
            document.selection.empty();
        }
    }

    // TODO: use this function instead dangerouslySetInnerHTML
    wrapTags=(text, regex, className)=>  {
        const textArray = text.split(regex);

        return textArray.map(str => {
          if (regex.test(str)) {
            return <span className={className}>{str}</span>;
          }
          return str;
        });
      };
      
      onTagCliked=(tagId, textToSelect)=> {
          // if same tag selected as previous then remove highlight else highlight
          if(this.highlightedTagId == tagId) {
            this.removeHighlight();
            this.highlightedTagId = '';
          }
          else {
            this.commentText = this.addHighlightClass(this.props.comment.text, textToSelect, "tag-highlight");
            this.highlightedTagId = tagId;
            this.setState({refresh: !this.state.refresh});
          }
      }
      onTagToPostClicked=async(tagId)=> {
        this.props.onTagToPostClicked(tagId, this.props.comment.post);
      }

      onRemoveTaggedPost=async(tagId)=> {
        this.props.onRemoveTaggedPost(tagId, this.props.comment.post);
      }
    
    currentElMouseDownHandler = (event) => {
        // console.log('currentElMouseDownHandler', event.nativeEvent, event.nativeEvent.clientX, event.nativeEvent.clientY);
        // record current event to get popup position
        this.mouseDownEvent = event.nativeEvent;
        // listen for mouse up event within this component and complete document to get the selected text
        this.selectRef.current.addEventListener('mouseup', this.currentElMouseUpHandler);
        document.addEventListener('mouseup', this.documentMouseUpHandler);
    }

    currentElMouseUpHandler = (event) => {
        // console.log('currentElMouseUpHandler', event);
        // if here, it means, text has been selected normally within the comment area 
        // so we don't need to listen for mouseup on complete document.
        document.removeEventListener('mouseup', this.documentMouseUpHandler);

        // get the selected text
        this.selectedText = this.getSelectedText();

        // handle text selection
        this.handleOnSelect(event);

        // remove unwanted handlers and clear unwanted variables
        this.selectRef.current.removeEventListener('mouseup', this.currentElMouseUpHandler);
        this.mouseDownEvent = null;
    }

    documentMouseUpHandler = (event) => {
        // console.log('documentMouseUpHandler', event, event.clientX, event.clientY);
        // if here, it means, text has been selected outside the comment area 
        // so we don't need to listen for mouseup within the comment area anymore.
        this.selectRef.current.removeEventListener('mouseup', this.currentElMouseUpHandler);

        // get the selected text based on mouse position
        this.selectedText = '';
        let selectedTexts = this.getSelectedText().split('\n');
        if (event.clientX < this.mouseDownEvent.clientX || event.clientY < this.mouseDownEvent.clientY) {
            // console.log(selectedTexts[selectedTexts.length-1]);
            this.selectedText = selectedTexts[selectedTexts.length-1];
        } else if (event.clientX > this.mouseDownEvent.clientX || event.clientY > this.mouseDownEvent.clientY) {
            // console.log(selectedTexts[0]);
            this.selectedText = selectedTexts[0];
        } else {
            // console.log(selectedTexts);
            this.selectedText = '';
        }

        // if valid selected text then handle text selection
        if (this.selectedText) {
            this.handleOnSelect(this.mouseDownEvent);
        }

        // remove unwanted handlers and clear unwanted variables
        document.removeEventListener('mouseup', this.documentMouseUpHandler);
        this.mouseDownEvent = null;
    }

    render() {
        return (
            <div className="select-tag" >
                {/* Locale comment and edit icon for locale comment should be aligned in same line hence span for locale comment elements */}
                {
                    this.props.localeCommentEl
                    ?
                        <span onMouseDown={this.props.tagOperationAllowed ? this.currentElMouseDownHandler: () => {}} ref={this.selectRef} dangerouslySetInnerHTML={{
                            __html: this.commentText
                        }} />
                    :
                        <div onMouseDown={this.props.tagOperationAllowed ? this.currentElMouseDownHandler: () => {}} ref={this.selectRef} dangerouslySetInnerHTML={{
                            __html: this.commentText
                        }} />
                }
                {/* Edit icon el for locale comment */}
                {
                    this.props.localeCommentEl && this.props.editable && 
                    <span className="comment-edit" onClick={(event) => { this.props.onEditHandler(event, true) }}><FaPencilAlt size="14" /></span>
                }
                <div className="created-tag">
                   {
                       this.tagList && this.tagList.map((tag, index)=> {
                            return <Tag key={`${tag.comment}-${index.toString()}`} 
                                tagOperationAllowed={this.props.tagOperationAllowed}
                                tagContent={tag}
                                activeClass={this.highlightedTagId == tag.tagId ? 'active-tag' : 'selected-tag'}//dont remove spance after active-tag class
                                isTagged={tag.posts?tag.posts.includes(this.props.comment.post):false}
                                tagClikHandler={this.props.tagOperationAllowed ? this.onTagCliked : () => {}}
                                tagToPost={this.onTagToPostClicked}
                                removeTaggedPost={this.onRemoveTaggedPost}
                                removeTag={this.props.onRemoveClickHandler}
                            />
                       })
                   }
                </div>
            </div>
        );
    }
}

export default SelectTag;