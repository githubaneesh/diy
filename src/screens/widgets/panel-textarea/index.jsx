import React, { Component } from 'react';
import './style.scss';
import TextEditor from "../wysiwyg-editor";

class PanelTextArea extends Component {
    constructor(props){
        super(props);
        this.state = {
            textValue: props.textValue,
        }
  
        this.onChangeHandler = this.onChangeHandler.bind(this);
    }

    onChangeHandler (content) {
        this.setState({
            textValue: content
        });
        this.props.changeHandler(content);
    }

    render(){
        const { multiline, rows, labelText, type, editorStyle} = this.props;

        return(
            <div className="panel">
                <span> {labelText} </span>
                {
                    type === "editor" ?
                        <TextEditor
                            onChange={this.onChangeHandler}
                            content={this.state.textValue}
                            style={editorStyle}
                        />
                    :
                        <textarea
                            onChange={(e) => this.onChangeHandler(e.target.value)}
                            rows={rows}
                            value={this.state.textValue}
                            style={editorStyle}
                        ></textarea>
            }
            </div>
        );
    }
}

export default PanelTextArea;