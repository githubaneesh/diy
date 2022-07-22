import React, { Component } from 'react';
import "./style.scss";
import Dropdown from '../../../widgets/dropdown';
import Utility from '../../../../utility/Utility';
import { FaTrash } from "react-icons/fa";
import RadioGroup from '../radio-group';

class ChildDetails extends Component {

    constructor(props){
        super(props);
        this.state = {
            refresh: false
        }
        this.childObj = props.data ? props.data : {name:this.props["name"]};
        this.selectedYear = undefined;
        if(props.data["birthdate"]){
            let da = new Date(this.props.data["birthdate"]);
            const year = da.getFullYear().toString();
            this.selectedYear = { value: year, label: year };
        }
    }

    dropDownChangeHandler = (birthYear) => {
        let childBirthdate = new Date();
        childBirthdate.setFullYear(parseInt(birthYear.value))
        this.childObj["birthdate"] = childBirthdate;
        this.props.onValuesChange(this.childObj, this.props.childIndex);
    }
    genderChangeHandler=(gender)=> {
        this.childObj["gender"] = gender;
        this.props.onValuesChange(this.childObj, this.props.childIndex);
    }
    handleChildNameChange = (event)=>{
        this.childObj["name"] = event.target.value;
        this.props.onValuesChange(this.childObj, this.props.childIndex);
    }
  
    render() {
        return (
            <div className="child">
                <div className="grid-item">
                    <div>Name</div>
                    <input type="text" defaultValue={this.childObj.name} onChange={this.handleChildNameChange}/>
                </div>
                <div className="grid-item">
                    <div>Birthdate</div>
                    <Dropdown defaultOptionText="" 
                        selected={this.selectedYear}
                        optionsData={Utility.getYearsList()} 
                        onChangeHandle={this.dropDownChangeHandler}
                        placeholder={"Any"}/>
                </div>
                <div className="grid-item">
                    <div>Select a gender:</div>
                    <RadioGroup name={this.props.name+this.props.childIndex} options={Utility.getGenderList(this.childObj.gender)} changehandler={this.genderChangeHandler}/>
                </div>
                <div className="grid-item">
                    <button className="button delete" onClick={()=>this.props.onRemove(this.props.childIndex)}><FaTrash/></button>
                </div>                          
            </div>
        );
    }
}

export default ChildDetails;