import React, { Component } from 'react';
import TextEditor from "../wysiwyg-editor";
import './style.scss';
import { FaCheck, FaChevronUp, FaChevronDown } from "react-icons/fa";
import Loader from '../loader';
import Utility from '../../../utility/Utility';

class AutoSaveTextArea extends Component {
    constructor (props) {
        super(props);
        this.state = {
            textValue: props.textValue,
            hasDirtyAttributes: false,
            isSaving: false,
            isSaved: false,
            active: true
        }
        this.timer  = null;
        this.saveData = this.saveData.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);
    }

    componentDidUpdate (prevProps) {
        if (this.props.textValue != prevProps.textValue) {
            this.setState({
                textValue: this.props.textValue
            })
        }
        if (this.props.textValue != prevProps.textValue && this.props.textValue != this.state.textValue) {
            this.setState({
                hasDirtyAttributes: false,
                isSaving: false,
                isSaved: false
            })
        }
    }

    onChangeHandler (content) {
        const hasDirtyAttributes = content !== this.props.textValue;
        this.setState({
            textValue: content,
            hasDirtyAttributes,
            isSaved: false,
            isSaving: true
        });
        if (hasDirtyAttributes) {
            clearTimeout(this.timer);
            this.timer = setTimeout(this.saveData, 2000);
        }
        else {
            this.setState({isSaving: false});
        }
    }
    
    saveData () {
        if(this.emptyAllowed !== undefined && !this.emptyAllowed && !Utility.isValidText(this.state.textValue)) {
            this.setState({
                isSaving: false,
                hasDirtyAttributes: false,
                isSaved: false
            });
            // call onerror on invalid text
            if(this.props.onError) {
                this.props.onError(this.state.textValue);
            }
        }
        else {
            this.props.saveData(this.state.textValue);
            this.setState({
                isSaving: false,
                hasDirtyAttributes: false,
                isSaved: true
            });
            this.timer = setTimeout(()=> {
                this.setState({
                    isSaving: false,
                    hasDirtyAttributes: false,
                    isSaved: false
                });
            }, 4000);
        }
    }

    toggleEditor() {
        this.setState({active: !this.state.active});
        this.props.collapeTextEditorHandler(this.state.active);
    }

    render() {
        const { rows, type, editorStyle, title, emptyAllowed=true} = this.props;
        return (
          <div className="autosave">
              <div className={this.props.collapsible?"heading":"heading disabled"} onClick={()=>this.toggleEditor()}>{
                    this.props.collapsible && <span className="space-right">
                        {this.state.active ? (<FaChevronUp size={18} />) : (<FaChevronDown size={18} />)}
                    </span>
                }              
                <span>{title}</span>
              </div>
                <div className={this.state.active? "" : "collapse"}>
                    {
                        type === "editor" ?
                        <TextEditor
                        onChange={this.onChangeHandler}
                        content={this.state.textValue}
                        style={editorStyle}
                    />
                    : <textarea
                        onChange={(e) => this.onChangeHandler(e.target.value)}
                        rows={rows}
                        value={this.state.textValue}
                        style={editorStyle}
                    ></textarea>
                    }
                    {this.state.isSaving && <span className="label-saving"><Loader/></span>}
                    {this.state.isSaved && <span className="label-saving"><FaCheck/> Saved</span>}
                </div>

          </div>
        );
    }
}

export default AutoSaveTextArea;