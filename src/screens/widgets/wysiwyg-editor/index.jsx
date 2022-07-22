import React, { Component } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import "../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
class TextEditor extends Component {
    constructor (props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(),
            content: props.content
        }
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
    }

    componentWillMount () {
        if (this.props.content) {
            this.handleEditorInitialState(this.props.content)
        }
    }

    handleEditorInitialState (propContent) {
        const blocksFromHtml = htmlToDraft(propContent);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        const editorState = EditorState.createWithContent(contentState);
        this.setState({
            editorState,
            content:propContent
        })
    }

    componentDidUpdate (prevProps) {
        if (this.props.content != prevProps.content && this.props.content != this.state.content) {
            this.handleEditorInitialState(this.props.content);
        }
    }

    onEditorStateChange (editorState) {
        let content = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        this.setState({
            editorState,
            content
        });
        if (this.state.content != content) {
            const focusCheck = (!this.props.content && content.replace(/\r?\n|\r/, "") == "<p></p>");
            if (!focusCheck) {
                this.props.onChange(content)
            }
        }
    }

    render() {
        const { editorState} = this.state;
        return (
            <div style={this.props.style}>
            <Editor
                stripPastedStyles={true}
                toolbar={{
                    inline: { inDropdown: true },
                    options: ['inline', 'blockType', 'textAlign', 'history'],
                    blockType: {
                        inDropdown: true,
                        options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote'],
                        className: undefined,
                        component: undefined,
                        dropdownClassName: undefined,
                    }
                }}
                editorState={editorState}
                onEditorStateChange={this.onEditorStateChange}
            />
            </div>
        );
    }
}

export default TextEditor;