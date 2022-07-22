import React, { Component } from 'react';
import "./style.scss";

class StudySearch extends Component {
    _timer = null;
    constructor() {
        super();
        this.state = {
            textValue: null
        }
        this.onChangeHandler = this.onChangeHandler.bind(this);
    }
    onChangeHandler (content) {
        this.setState({textValue: content});
        clearTimeout(this.timer);
        this.timer = setTimeout(this.handleBlur, 500);
        
    }
    clearText = () => {
        this.setState({textValue: ''});
    }
    handleBlur = () =>{
        this.props.onValueChange(this.props.searchKey, this.state.textValue);
    }
    render() {
        return (
            <div className="search-input">
                <input type="text" placeholder={this.props.placeholder}
                    value={this.state.textValue || ""}
                    onChange={(e) => this.onChangeHandler(e.target.value)} />

            </div>
        );
    }
}

export default StudySearch;