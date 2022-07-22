import React, { Component } from 'react';
import './style.scss';

class PostComment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "",
            disableSubmit: props.disabled,
            savingData: false
        }
        this.inputElement = null;
        this.onTextChanged = this.onTextChanged.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({ disableSubmit: this.props.disabled });
        }
    }

    onTextChanged (event) {
        if(event.target.value) {
            this.setState({
                text: event.target.value,
            });
        }
    }

    async handleSubmit() {
        if(this.state.text && this.state.text.trim()) {
            this.setState({ disableSubmit: true, savingData: true }, async () => {
                await this.props.saveComment(this.state.text);
                this.inputElement.value = "";
                this.setState({ text: "", disableSubmit: this.props.disabled || false, savingData: false });
            });
        }
        
    }

    async handleKeyDown(e) {
        if (e.key === "Enter" && !this.state.savingData && this.state.text && this.state.text.trim()) {
            this.setState({ savingData: true })
            await this.handleSubmit();
        }
    }

    render() {
        return (
            <div className="comment-container">
                <input ref={ref=> this.inputElement = ref} onKeyDown={this.handleKeyDown} type="text" disabled={this.state.savingData || this.props.disabled} onChange={this.onTextChanged} />
                <button className="button" disabled={this.state.disableSubmit} onClick={this.handleSubmit}>Submit</button>
            </div>
        );
    }
}

export default PostComment;