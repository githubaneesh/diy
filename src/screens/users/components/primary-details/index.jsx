import React, { Component } from 'react';
import "./style.scss"
import ToggleSwitch from '../../../widgets/toggle-switch/index';
import Calendar from '../../../widgets/calendar/index';
import RadioGroup from '../radio-group';
import Utility from '../../../../utility/Utility';
import UserType from '../../../../common/userType';

class PrimaryDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: this.props.data.password,
            age: this.props.data.birthdate ? Utility.getAge(this.props.data.birthdate) : undefined
        }
    this.userObject = this.props.data;
    }

    componentWillReceiveProps(prevProps){
        if(prevProps.userType !== this.props.userType){
            let ageVal;
            this.userObject = this.props.data ? this.props.data : {};
            if(this.userObject.birthdate) {
                ageVal = Utility.getAge(this.userObject.birthdate);
            }
            this.props.fieldValueChange(this.userObject);
            this.setState({password: this.props.data.password ? this.props.data : undefined, age : ageVal})
        }
    }

    genderChangeHandler = (gender)=> {
        console.log('gender change handler', gender)
        this.userObject["gender"] = gender;
        this.props.fieldValueChange(this.userObject);
    }
    dateChangeHandler=(date)=> {
        console.log('date change handler', date)
        this.userObject["birthdate"] = date;
        this.props.fieldValueChange(this.userObject);
        this.setState({
            age : Utility.getAge(date)
        })
    }
    generatePassword=(boo)=> {
        if(boo) {
            this.setState({password: undefined});
        }
        else {
            this.setState({password: Utility.randomStr()});
        }
    }
    inputChange = (event, key)=>{
        this.userObject["password"] = this.userObject["password"] || Utility.randomStr();
        this.userObject[key] = event.target.value;
        this.props.fieldValueChange(this.userObject);
    }
    render() {
        return (
            <div className="basic-details">
                <div className="name">
                    <div className="grid-item">
                        <div className="label">First Name</div>
                        <input type="text" defaultValue={this.userObject.firstName} onChange={(event)=>{this.inputChange(event, "firstName")}}/>
                    </div>
                    <div className="grid-item">
                        <div className="label">Last Name</div>
                        <input type="text" defaultValue={this.userObject.lastName}  onChange={(event)=>{this.inputChange(event, "lastName")}}/>                        
                    </div>
                    <div className="grid-item">
                        {
                            this.props.birthdate ?
                                <div className="birthage">
                                    <div className="birthdate">
                                        <div className="label">Birthdate</div>
                                        <Calendar defaultDate={Utility.convertToDateString(this.userObject.birthdate)} onChange={this.dateChangeHandler}/>
                                    </div>
                                    <div className="age">
                                    {
                                        (this.state.age !== undefined) && (<div>
                                            <div className="label">Age</div>
                                        <label>{this.state.age}</label>
                                        </div>)
                                    }
                                    </div>
                                    
                                </div>
                                
                                : <div className="email">
                                    <div className="label">Email</div>
                                    <input type="text" defaultValue={this.userObject.email} onChange={(event) => { this.inputChange(event, "email") }} />
                                </div>
                        }

                    </div>
                    <div className="grid-item">
                        {
                            this.props.phone &&
                            <div className="phone">
                                <div className="label">Phone</div>
                                <input type="text" defaultValue={this.userObject.phone} onChange={(event)=>{this.inputChange(event, "phone")}}/> 
                            </div>
                        }
                    </div>
                </div>
                {
                    this.props.gender &&
                    <div className="gender-select">
                        <div className="label">Select a gender:</div>
                        <RadioGroup name="gender" options={Utility.getGenderList(this.userObject.gender)} changehandler={this.genderChangeHandler}/>
                    </div>
                }
                {
                    (this.props.userType && this.props.userType.toLowerCase() === UserType.PROSPECT) && (
                        <div className="email">
                            <div className="label">Email</div>
                            <input type="text" defaultValue={this.userObject.email} onChange={(event) => { this.inputChange(event, "email") }} />
                        </div>
                    )
                }
                <div className="password">
                    {
                        this.props.parentKey ? <div className="label">Password</div> : <div className="label">Generate Password</div>
                    }
                    
                    {
                        this.props.parentKey ? <input className="gpassword" type="password" defaultValue={this.userObject.password} onChange={(event) => { this.inputChange(event, "password") }} />
                            : <ToggleSwitch handleChange={this.generatePassword} />
                    }
                    
                    {
                        (this.state.password && !this.props.parentKey ) && <input className="gpassword" type="password"  defaultValue={this.state.password} onChange={(event)=>{this.inputChange(event, "password")}}/>
                    }
                </div>
            </div>
        );
    }
}

export default PrimaryDetails;