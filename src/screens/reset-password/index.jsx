import React, { Component } from 'react';
import "./style.scss";
import Utility from '../../utility/Utility';

class ResetPassword extends Component {
    constructor() {
        super();
        this.state = {
            reseted: false,
            email: undefined
        }
    }
    onSubmitClick=()=> {
        this.setState({reseted:true});

        // api call goes here
    }
    validateEmail=(event)=> {
        const emailValue = event.target.value;
        if(Utility.isValidEmail(emailValue)) {
            this.setState({email: emailValue});
        }
        else {
            this.setState({email: undefined});
        }     
    }
    render() {
        return (
            <div className="reset-password">
                <div className="breadcumbs">Reset Password</div>
                <div className="reset-password-inputs">
                    <div className="title">Reset Password</div>
                    <div>
                        {
                            this.state.reseted ?
                            <div className="success">
                                {
                                `If an account is registered to ${this.state.email} then an email will be sent with instructions on how to reset your password`
                                }
                            </div>
                            :<div>
                                <label>Enter your email address below</label>
                                <input type="email" onChange={this.validateEmail}></input>
                                <div className="btn-container">
                                    <button disabled={!this.state.email} className="button" onClick={this.onSubmitClick}>Submit</button>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default ResetPassword;