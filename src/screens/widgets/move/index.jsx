import React, { Component } from 'react';
import './style.scss';
import { FaCaretUp, FaCaretDown } from "react-icons/fa";

class Move extends Component {
   
    render(){

        return(
            <div className="move">
                <button className={this.props.onUpArrowClick ? "up" : "disable-up"} onClick={this.props.onUpArrowClick}>
                    <FaCaretUp/>
                </button>
                <button className={this.props.onDownArrowClick ? "down" : "disable-down"} onClick={this.props.onDownArrowClick}>
                    <FaCaretDown/>
                </button>
            </div>
        );
    }
    

}

export default Move;