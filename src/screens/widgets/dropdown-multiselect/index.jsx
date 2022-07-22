import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './style.scss';
import { FaChevronDown, FaLock } from "react-icons/fa";

class DropdownMultiSelect extends Component {
    selectedOptions=[];
    constructor (props) {
        super(props);
        this.state = {
            active: false
        };
        this.selectedOptions = this.props.selected? this.props.selected : [];
    }
    
    handleChange = (e) => {
        if(e.target.checked) {
            this.selectedOptions.push(e.target.value)
        }
        else {
            const opitonIndex = this.selectedOptions.indexOf(e.target.value)
            this.selectedOptions.splice(opitonIndex, 1)
        }
        let selectedIds = this.selectedOptions.map(p => { return p.value || p })
        this.props.onChangeHandle(selectedIds);
    };

    handleClick=()=>{
        this.setState({active: !this.state.active});
    }

    handleUntilEnabledClick=(e)=> {
        this.props.onUntilEnabledChange(e.target.checked);
    }

    getDropdownButtonLabel = obj => {
        return obj.placeholderButtonLabel;
    }

    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside, true);
    }
    
    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    }

    handleClickOutside = event => {
        const domNode = ReactDOM.findDOMNode(this);
        if (!domNode || !domNode.contains(event.target)) {
            this.setState({active: false});
        }
    }

    isSelected=(id)=> {
        const val = this.selectedOptions.find((item)=> item.value === id);
        return val?true:false;
    }

    render(){
        return (
        <div className="dropdown-multiselect">
            <div onClick={this.handleClick} className="dropdown-header">
                {
                    this.props.untilEnabled && <FaLock/>
                }
                {this.props.placeholder} <span className="icon"><FaChevronDown /></span>
                <span className="clear-fix"></span>
            </div>
            <ul className={this.state.active?"dropdown-list active":"dropdown-list"}>
                {
                    this.props.optionsData.map((item, index)=> {
                        return <li key={`multiselect-${index}`} className="list-item">
                            <input type="checkbox" id={`multiselect-${this.props.uniqueId}-${index}`} 
                                onClick={this.handleChange} value={item.value} defaultChecked={this.isSelected(item.value)}/>
                            <label className="label" htmlFor={`multiselect-${this.props.uniqueId}-${index}`}>{item.label}</label>
                        </li>
                    })
                }
                {
                    this.props.untilEnabled && 
                    <li className="list-item until-enabled">
                        <input id={this.props.uniqueId} type="checkbox" onClick={this.handleUntilEnabledClick} 
                            defaultChecked={this.props.untilEnabledSelected}/>
                        <label className="label" htmlFor={this.props.uniqueId}>Until Enabled</label>
                    </li>
                }
            </ul>
        </div>
        );
    }

}

export default DropdownMultiSelect;