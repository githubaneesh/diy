import React from 'react';
import Loader from '../../widgets/loader';
import PropTypes from 'prop-types';
import './style.scss';

const PrivacyPolicy = (props) => {

    const { showLoader } = props;
    return (
        <div className="private-policy">
            <div className="privacy-policy-content">
                <p className="title">Welcome to LookLook<sup>&#174;</sup>! Let's Get Started</p>
                <p className="content">Click on the below links and please read our Terms of Conditions Agreement and Privacy Policy. By checking the box below, you acknowledge and agree that you have read these documents and agree to the terms.</p>
                <p className="content">For our Terms of Service, <a href="https://static1.squarespace.com/static/57ee9f0c15d5db8fe164b4f7/t/5c1117dd6d2a73d7ab16c0b0/1544624093470/LookLook+Terms+of+Service.pdf" target="_blank">click here</a>. | For our Privacy Policy, <a href="https://static1.squarespace.com/static/57ee9f0c15d5db8fe164b4f7/t/5c111880c2241b7d0c8c8549/1544624256466/LookLook+Privacy+Policy.pdf" target="_blank">click here</a>.</p>
                <hr />
            </div>
            <div>
                <div className="btn-container">
                    {
                        !showLoader ? <button className="button" onClick={props.handleAgreeClick}><span>I Agree</span></button>
                            : <span className="agree_spinner"> <Loader /> </span>
                    }
                </div>
            </div>
        </div>
    );

}

PrivacyPolicy.propTypes = {
    showLoader: PropTypes.bool,
    handleAgreeClick: PropTypes.func
}

export default PrivacyPolicy;