import React from 'react'
import PropTypes from 'prop-types';
import './style.scss';

const Switch = (props) => {
    
    return (
        <label className={`switch ${props.className}`}>
            <input type="checkbox" onChange={(event)=>{props.onChange(event.target.checked)}} checked={props.checked} />
            <span className="slider round"></span>
       </label>
    );
}

Switch.propTypes = {
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    className: PropTypes.string
}

Switch.defaultProps = {
    className: '',
    checked: true,
    onChange: (e)=>{
        console.log("Switch onChange : ", e)
    }
}


export default Switch;
