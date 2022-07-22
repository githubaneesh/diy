import React, { Component } from 'react';
import './style.scss';

class Loader extends Component {
    state = {  }
    render() {
        return (
            <span className="spinner"></span>
        );
    }
}

export default Loader;