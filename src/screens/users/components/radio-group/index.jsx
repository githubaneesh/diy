import React, { Component } from 'react';

class RadioGroup extends Component {
    onChanged=(e)=> {
        this.props.changehandler(e.currentTarget.value);
    }
    render() {
        return (
            <div className="gender">
                {
                    this.props.options.map((option, index)=> {
                        return <span key={this.props.name+option.value+index}>
                                <input onChange={this.onChanged} type="radio" defaultChecked={option.checked ? option.checked : false}
                                    name={this.props.name} id={this.props.name+option.value+index} value={option.value}/>
                                <label htmlFor={this.props.name+option.value+index}>{option.label}</label>
                            </span>
                    })
                }
            </div>
        );
    }
}

export default RadioGroup;