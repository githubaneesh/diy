import React, { Component } from 'react';
import './style.scss';

class Accordian extends Component {
    render() {
        return (
            <div id="accordion">
                {this.props.children}
            </div>
        )
    }
}

export default Accordian;