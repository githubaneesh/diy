import React, { Component } from 'react';
import { FaTimes } from "react-icons/fa";
import "./style.scss";

class FilterInput extends Component {
    constructor() {
        super();
        this.state = {
            textValue: ''
        }
        this.onChangeHandler = this.onChangeHandler.bind(this);
    }
    clearText() {
        this.setState({textValue: ''});
        this.props.clearLocation(this.props.searchKey)
    }
    onChangeHandler (content) {
        this.setState({textValue: content})
    }
    
    handleBlur = () =>{
        if(this.state.textValue){
            this.props.onValueChange(this.props.searchKey, this.state.textValue);
        }
    }
    render() {
        return (
            <div className="filter-input">
                <input type="text" placeholder={this.props.placeholder}
                    value={this.state.textValue}
                    onChange={(e) => this.onChangeHandler(e.target.value)}
                    onBlur={this.handleBlur} />
                {
                    this.state.textValue &&
                    <button className="button" onClick={()=>this.clearText()}><FaTimes/></button>
                }
            </div>
        );
    }
}

export default FilterInput;