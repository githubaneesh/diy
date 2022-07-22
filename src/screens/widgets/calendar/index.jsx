import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.scss';
import {FaRegCalendarAlt} from 'react-icons/fa'

export default class Calendar extends Component {

    render(){
        return (
                <div className="calendar-container">
                    <input className="date-picker" type="date" required
                        data-placeholder="dd/mm/yyyy"
                        max="9999-12-31"
                        defaultValue = {this.props.defaultDate}
                        onChange={(e)=>{this.props.onChange(e.target.value)}} />
                    <span className="open-button">
                        <button type="button">
                            <FaRegCalendarAlt size={21}/>
                        </button>
                    </span>
                </div>
        );
    }
}

Calendar.propTypes = {
    onChange : PropTypes.func
}
