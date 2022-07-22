import React, { Component } from 'react';
import StudyCard from "./studycard";
import "./style.scss";
import StudiesController from "./studies";
import StudyType from '../../common/studyType';
import GoogleTranslateService from "../../services/googletranslate";
import CookieService from "../../services/cookieservice";
import UserType from "../../common/userType";
import Loader from '../widgets/loader';
import RoutesUtility from '../../utility/routesutility';
import WelcomText from './components/welcome-text';
import StudySearch from './study-search';
const _googleTranslate = GoogleTranslateService.instance;

class studies extends Component {
    _studies;
    _user;
    _cookieService = CookieService.instance;
    index = 0;
    limit = 10;
    _validStudyTypes = [];
    _search = null;
    constructor(props) {
        super(props);
        this.state = {
            isHiddenStudy: false,
            isFetchingStudies: false,
            isArchived: props.studyType.toLowerCase() == StudyType.ARCHIVED ? true: false,
            isFetching: true,
            refresh: false
        };
        this.searchRef = React.createRef();
        this.initValidStudyTypes();
        this._studies = new StudiesController(this);
        this.onStudyTypeClicked = this.onStudyTypeClicked.bind(this);
        this.onCreateStudyClicked = this.onCreateStudyClicked.bind(this);
        this.onStudyClicked = this.onStudyClicked.bind(this);
        this.onTranslateClicked = this.onTranslateClicked.bind(this);
        this.onDownloadStudyClicked = this.onDownloadStudyClicked.bind(this);
        this.onArchiveUnarchiveStudy = this.onArchiveUnarchiveStudy.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    initValidStudyTypes () {
        for (var prop in StudyType) {
            if (Object.prototype.hasOwnProperty.call(StudyType, prop)) {
                this._validStudyTypes.push(StudyType[prop])
            }
        }
    }

    componentWillMount () {
        const {history, studyType} = this.props;
        if (!(this._validStudyTypes.includes(studyType.toLowerCase()))) {
            history.replace(RoutesUtility.STUDIES());
        }
    }
    
    componentDidMount () {
        this._user = this._cookieService.user;
        // _googleTranslate.translate()
        this.setState({ isFetching: true }, async () => {
            await this._studies.fetchStudies(this.props.studyType, this.index, this._search, this.limit);
            this.setState({refresh: !this.state.refresh, isFetching: false});
        });
        window.addEventListener('scroll',this.handleScroll);
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.handleScroll);
    }

    async handleScroll(event){
        //if end of page is reached then fetch next user details
        if (this.state.isFetchingStudies) {
            return
        }
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight*0.6)) {
            this.setState({isFetchingStudies: true}, async () => {
                this.index = this.limit + this.index;
                await this._studies.fetchStudies(this.props.studyType, this.index, this._search, this.limit);
                this.setState({isFetchingStudies: false});
                this.refreshUI();
            });
        }
    }

    componentDidUpdate(prevProps) {
        const { studyType } = this.props;
        if (prevProps.studyType != studyType) {
            // study type changed
            this.index = 0;
            this.limit = 10;
            this._studies.studies = []
            this.setState({
                isFetching: true,
                isArchived: studyType.toLowerCase() == StudyType.ARCHIVED ? true : (this.state.isHiddenStudy ? true : false)
            }, async () => {
                await this._studies.fetchStudies(studyType, this.index, this._search, this.limit)
                this.setState({refresh: !this.state.refresh, isFetching: false});
            });
        }
    }

    refreshUI () {
        this.setState({
            refresh: !this.state.refresh
        })
    }

    onStudyTypeClicked () {
        this._search = null;
        this.searchRef.clearText();
        this.setState({
            isHiddenStudy: false
        });
        const { history, studyType } = this.props;
        const path = studyType.toLowerCase() == StudyType.UNARCHIVED ? StudyType.ARCHIVED : StudyType.UNARCHIVED;
        this._studies.studies = []
        history.push(`${RoutesUtility.STUDIES()}/${path}`);
    }

    onCreateStudyClicked () {
        const { history } = this.props
        history.push(RoutesUtility.CREATE_NEW_STUDY());
    }

    onStudyClicked (study) {
        const { history, studyType } = this.props;
        history.push(RoutesUtility.STUDY_VIEW(study));
    }

    async onTranslateClicked (e, study) {
        if (e) {
            e.stopPropagation();
        }

        const translatedTitle = await _googleTranslate.translateToDefault(study.name);
        if (!translatedTitle.error) {
            study["translatedName"] = translatedTitle.body[0].translatedText;
        }
        const translatedObjective = await _googleTranslate.translateToDefault(study.description);
        if (!translatedObjective.error) {
            study["translatedDescription"] = translatedObjective.body[0].translatedText;
        }
        if(!translatedObjective.error && !translatedTitle.error) {
            this.refreshUI();
        }

    }

    onDownloadStudyClicked () {

    }

    async onArchiveUnarchiveStudy (e, study) {
        if (e) {
            e.stopPropagation();
        }
        const { studyType } = this.props;
        const studyIndex = this._studies.studies.findIndex(i=>i._id==study);
        const isArchive = studyType.toLowerCase() == StudyType.UNARCHIVED ? true : false;
        const archive = await this._studies.archiveStudy(study, isArchive);
        console.log("archive", archive);
        this._studies.studies.splice(studyIndex, 1);
        this.refreshUI();
        // alert(`${studyIndex}-${study}`);
    }

    onHiddenStudyChecked = (e) => {
        const {history} = this.props;
        this._search = null;
        this.searchRef.clearText();
        this.setState({
            isHiddenStudy: !this.state.isHiddenStudy
        }, async () => {
            if (this.state.isHiddenStudy) {
                history.push(`/studies/${StudyType.HIDDEN}`);
            } else {
                history.push(`/studies/${StudyType.ARCHIVED}`);
            }
        });
    }

    handleSearch = (searchKey, searchText) =>{
        this._studies.studies = [];
        this._search = searchText;
        const { studyType } = this.props;
        this.index = 0;
        this.limit = 10;
        this.setState({
            isFetching: true,
            isArchived: studyType.toLowerCase() == StudyType.ARCHIVED ? true : (this.state.isHiddenStudy ? true : false),
        }, async () => {
            await this._studies.fetchStudies(studyType, this.index, this._search, this.limit)
            this.setState({refresh: !this.state.refresh, isFetching: false});
        });
    }
    render() {
        const isAdmin = (this._user && this._user.userType.toLowerCase() == UserType.ADMIN);
        const showCreate = (this._user && (this._user.userType.toLowerCase() == UserType.ADMIN || this._user.userType.toLowerCase() == UserType.CLIENT_ADMINISTRATOR));
        const showArchivedUnArchievedBtn = (this._user && (this._user.userType.toLowerCase() == UserType.ADMIN || this._user.userType.toLowerCase() == UserType.CLIENT || this._user.userType.toLowerCase() == UserType.CLIENT_ADMINISTRATOR));
        return (
            <div className={"main-container"}>
                <div className="breadcumbs">Studies</div>
                <div className={"studies-container"}>
                    <WelcomText user={this._user}/>
                    <div className={"study-type"}>
                        {
                            showArchivedUnArchievedBtn && (<button className="button" onClick={this.onStudyTypeClicked}>
                                <span>{this.state.isArchived ? "Unarchived" : "Archived"}</span>
                            </button>)
                        }
                        
                        {
                            this.state.isArchived && (
                                <div className="hidden-text">
                                    <label className="" htmlFor="hidden">Show Hidden: </label>
                                    <input type="checkbox" id="hidden" onChange={this.onHiddenStudyChecked} checked={this.state.isHiddenStudy} />
                                </div>
                            )
                        }
                        {
                            showCreate && <div className={"create-study"} onClick={this.onCreateStudyClicked}>
                                <span>
                                    {"+ Create a new study"}
                                </span>
                            </div>
                        }
                    </div>
                    {
                        this.state.isArchived && (
                            <div className="divider-space hr"><span>Archived</span></div>
                        )
                    }
                    <div className="study-search">
                        <StudySearch 
                            ref={(cd) => this.searchRef = cd} 
                            searchKey="search" 
                            placeholder="Search by Study Name" 
                            onValueChange={this.handleSearch} />
                    </div>
                    <div className={"study-list"}>
                        {
                            this.state.isFetching ?
                            <Loader/> :
                            this._studies.studies.map((study, index) => <StudyCard
                                key={`study-${index}`}
                                name={study.name}
                                study={study}
                                isArchive={this.state.isArchived}
                                participantCount={study.participants || 0}
                                client={study.client.name}
                                date={study.studyDate}
                                brandImage={study.brandImageUrl}
                                imageObjectKey={study.imageObjectKey}
                                description={study.description}
                                // translateddescription={study.description}
                                archiveUnarchiveText={this.props.studyType.toLowerCase() == StudyType.UNARCHIVED ? "Archive Study" : "Unarchive Study"}
                                translatedName={study.translatedName}
                                // translatedName={"some dummy name"}
                                translateddescription={study.translatedDescription}
                                onStudyClicked={() => this.onStudyClicked(study._id)}
                                onTranslateClicked={(e) => this.onTranslateClicked(e, study)}
                                onEditClicked={() => this.onDownloadStudyClicked()}
                                onArchiveUnarchiveStudy={(e) => this.onArchiveUnarchiveStudy(e, study._id)}
                                isAdmin={isAdmin}
                            />
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default studies;