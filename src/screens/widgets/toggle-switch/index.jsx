import React, { Component } from 'react';
import './style.scss';
import Switch from '../switch';

class ToggleSwitch extends Component {
    constructor(props){
        super(props);
        this.state = {
            checked : props.defaultChecked === undefined ? true : props.defaultChecked
        }
    }

    handleChange = checkedVal => {
        this.setState({checked : checkedVal},
                        ()=>{
                            this.props.handleChange(this.state.checked)
                        })
    };

    componentDidUpdate(prevProps) {
        if (this.props.defaultChecked != prevProps.defaultChecked) {
            this.setState({
                checked: this.props.defaultChecked
            })
        }
    }

    render(){
        const {switchLabel} = this.props;

        return(
            <label>
                <span>{switchLabel}</span>
                <Switch className="react-switch"  
                    checked={this.state.checked}
                    onChange={this.handleChange} />
            </label>
        )
    }

}

export default ToggleSwitch;