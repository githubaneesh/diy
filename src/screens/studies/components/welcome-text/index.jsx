import React, { Component } from 'react';
import './style.scss';
import DisplayImage from '../../../widgets/display-image/index';
import UserType from '../../../../common/userType';
import { WelcomeText } from './welcome-text';

class WelcomText extends Component {
    render() {
        const {user} = this.props;
        const isClient = (user && (user.userType.toLowerCase() == UserType.CLIENT));
        const isClientAdmin = (user && (user.userType.toLowerCase() == UserType.CLIENT_ADMINISTRATOR));
        const isModerator = (user && (user.userType.toLowerCase() == UserType.MODERATOR));
        const showWelcomeTest = (isClient || isClientAdmin || isModerator);

        return (
            <div className="welcome-text">
                {
                    showWelcomeTest &&
                    <div>
                        <div className="title">Welcome</div>
                        <DisplayImage url={require("../../../../assets/spark-logo.png")}></DisplayImage>
                        {
                            isClientAdmin?
                            <div className="content" dangerouslySetInnerHTML={{
                                __html: WelcomeText.CLIENT_ADMINISTRATOR
                            }}/>
                            : <div className="content">
                                <p>
                                    {WelcomeText.CLIENT}                        
                                </p>                    
                            </div>
                        }
                    </div>

                }



            </div>
        );
    }
}

export default WelcomText;