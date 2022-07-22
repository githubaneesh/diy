import React, { Component } from 'react';
import { FaUser } from 'react-icons/fa';
import "./style.scss";

class Group extends Component {

    render() {
        return (
            <span className="group" onClick={this.props.onClick}>
                {this.props.name} (<FaUser/> {this.props.participants})
            </span>
        );
    }
}

export default Group;