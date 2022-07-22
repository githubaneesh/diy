import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import AppLayout from "../layouts/app-layout";
import App from "../App";
import Login from "../screens/login";
import Studies from "../screens/studies";
import Study from "../screens/studies/study";
import EditStudy from "../screens/studies/study/edit";
import { ToastContainer, Slide } from 'react-toastify';
import RoutesUtility from "../utility/routesutility";

import "../../node_modules/react-toastify/dist/ReactToastify.css";
import Users from '../screens/users';
import EditUser from '../screens/users/edit';
import ViewProfile from '../screens/users/profile';
import Settings from '../screens/settings';
import ParticipantProfile from '../screens/studies/participant-profile/index';
import ResetPassword from '../screens/reset-password/index';
import PrintParticipantsPost from '../screens/studies/print-participants-post/index';

const Routes = () => (
    <Router>
        <AppLayout>
            <Route exact path = "/*" component={App}/>
            <Route exact path="/login" component={Login} />
            <Route exact path="/reset-password" component={ResetPassword} />
            <Route exact path="/studies/:studyType?" render={(props) => (<Studies studyType={props.match.params.studyType || "unarchived"} {...props} />)}/>
            <Route exact path="/study/:study" render={(props) => (<Study studyId={props.match.params.study} {...props} />)}/>
            <Route exact path="/study/create/new" render={(props) => (<EditStudy type={RoutesUtility.STUDY_TABS.SET_UP_STUDY} {...props} />)}/>
            <Route exact path="/study/:study/edit/:type/:group?" render={(props) => (<EditStudy studyId={props.match.params.study} type={props.match.params.type} {...props} />)}/>
            <Route exact path="/users/list/:userType" render={(props) => (<Users userType={props.match.params.userType} {...props}/>)} />
            <Route exact path="/users/create/new" render={(props) => (<EditUser type={props.match.params.type} {...props} />)}/>
            <Route exact path="/users/:user/edit" render={(props) => (<EditUser userId={props.match.params.userId} type={props.match.params.type} {...props} />)}/>
            <Route exact path="/users/:user" render={(props) => (<ViewProfile userId={props.match.params.userId} type={props.match.params.type} {...props} />)}/>
            <Route exact path="/settings" component={Settings} />
            <Route exact path="/participant/:participant" render={(props) => (<ParticipantProfile participantId={props.match.params.participantId} {...props} />)}/>
            <Route exact path="/print/posts/participant/:participantId" render={(props) => (<PrintParticipantsPost participantId={props.match.params.participantId} {...props} />)}/>
            <ToastContainer hideProgressBar={true} transition={Slide} position="bottom-right" pauseOnHover={false} />
        </AppLayout>
    </Router>
);

export default Routes;