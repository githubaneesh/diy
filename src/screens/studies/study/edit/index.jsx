import React, { Component } from 'react';
import { Link } from "react-router-dom";
import CreateScreener from "./create-screener";
import DesignTopics from "../../../studies/study/edit/design-topics";
import CreateStudy from '../../../studies/study/edit/create-study';
import RoutesUtility from "../../../../utility/routesutility";
import CryptoHelper from '../../../../utility/cryptohelper';
import { FaChevronLeft, FaPrint } from "react-icons/fa";
import CookieService from '../../../../services/cookieservice';

class StudyEdit extends Component {
    _cookieService = CookieService.instance;
    user;
    constructor (props) {
        super(props);
        this.state = {
            type: props.type || RoutesUtility.STUDY_TABS.SET_UP_STUDY,
            printDisable: false
        }
        this.user = this._cookieService.user;
        this.backToStudy = this.backToStudy.bind(this);
        this.tabLinkClick = this.tabLinkClick.bind(this);
    }

    componentDidUpdate (prevProps) {
        if (this.props.type != prevProps.type) {
            this.setState ({
                type: this.props.type
            })
        }
    }

    returnDefaultTab () {
        // set default tab route in history
        const { history } = this.props;
        history.push(RoutesUtility.SETUP_STUDY(this.props.studyId));
    }
    async backToStudy(){
        const { history } = this.props;
        history.push(RoutesUtility.STUDY_VIEW(this.props.studyId));
    }

    tabLinkClick(routeUrl){
        const { history } = this.props;
        history.push(routeUrl);
    }

    handlePrintDisable = (disabled) =>{
        this.setState({printDisable: disabled});
    }

    handlePrintClick = ()=>{
        this.designTopicsComp.handlePrint();
    }

    renderTabbedComponent () {
        switch (this.props.type) {
            case RoutesUtility.STUDY_TABS.SET_UP_STUDY:
                return <CreateStudy studyId={this.props.studyId} {...this.props} />
            case RoutesUtility.STUDY_TABS.CREATE_SCREENER:
                return <CreateScreener studyId={this.props.studyId} />
            case RoutesUtility.STUDY_TABS.DESIGN_TOPICS:
                return <DesignTopics disablePrint={this.handlePrintDisable} ref={instance => {this.designTopicsComp = instance;}} studyId={this.props.studyId} {...this.props} />
            default:
                return this.returnDefaultTab();
        }
    }
    render() {
        return (
            <div> 
                <div className="navigation-button-container">
                    {
                        this.props.studyId &&
                        <button onClick={() => this.backToStudy()}><FaChevronLeft/><span>Return to moderating</span></button>
                    }
                </div>
                <div className="study-edit">
                    <ul className="tabs">
                        {
                        this.props.studyId ? <li onClick={()=>{this.tabLinkClick(RoutesUtility.SETUP_STUDY(this.props.studyId))}} className={this.props.type == RoutesUtility.STUDY_TABS.SET_UP_STUDY ? 'active' : ''}>
                            <Link to={RoutesUtility.SETUP_STUDY(this.props.studyId)}>Set Up Study</Link></li>
                            : <li className={this.props.type == RoutesUtility.STUDY_TABS.SET_UP_STUDY ? 'active' : ''}>Set Up Study</li>
                        }
                        
                        {
                            this.props.studyId ? <li onClick={()=>{this.tabLinkClick(RoutesUtility.DESIGN_TOPICS(this.props.studyId))}} className={this.props.type == RoutesUtility.STUDY_TABS.DESIGN_TOPICS ? 'active' : ''}>
                            <Link to={RoutesUtility.DESIGN_TOPICS(this.props.studyId)}>Design Topics</Link></li>
                            : <li className="disable-design-topics"> Design Topics </li>
                            
                        }
                        
                    </ul>
                    {
                        this.props.type === RoutesUtility.STUDY_TABS.DESIGN_TOPICS
                        && <div className="print-btn">
                                <button className="button" disabled={this.state.printDisable} onClick={this.handlePrintClick}>
                                    <FaPrint /> <span>Print</span>
                                </button>
                            </div>
                    }
                    {
                        this.renderTabbedComponent()
                    }
                </div>           
            </div>
        );
    }
}

export default StudyEdit;