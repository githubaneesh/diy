import React, { Component } from 'react';
import UserTable from './components/user-table';
import UserController from './users';
import FilterAndSort from './components/filter-and-sort';
import { FaPlus } from "react-icons/fa";
import "./style.scss";
import RoutesUtility from '../../utility/routesutility';
import Loader from '../widgets/loader/index';
import Utility from '../../utility/Utility';
import UserType from '../../common/userType';
import Settings from '../../config/settings';

class Users extends Component {

    _controller;
    index = 0;
    limit = 50;
    selectedOptions = {};
    constructor(props){
        super(props);
        this.state = {
            userType: 'all',
            refresh: false,
            isFetching: true,
            isFetchingMoreUsers: false,
            isFilterApplied:false,
            isDownloading:false
        }
        this._controller = new UserController();
        this._controller.state = this.state;
        this._controller.setState = this.setState.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    componentDidUpdate(prevProps) {
        const userType = this.props.userType;
        const prevUserType = prevProps.userType;
        if(prevUserType !== userType) {
            this.selectedOptions = {}
            this.index = 0;
            this.limit = 50;
            this._controller.Users = [];
            this.setState({userType: userType ? userType : 'all', isFetching: true, isFilterApplied:false }, async()=>{
                await this._controller.fetchUsers(this.index, this.limit, this.state.userType);
                await this._controller.getStudies();
                await this._controller.getOccupations();
                this.setState({refresh: !this.state.refresh, isFetching: false, isFilterApplied:false});
            });
        }
    }
    componentDidMount() {    
        const userType = this.props.userType 
        this.setState({ userType: userType ? userType : 'all' }, async () => {
            await this._controller.fetchUsers(this.index, this.limit, this.state.userType);
            await this._controller.getStudies();
            await this._controller.getOccupations();
            this.setState({refresh: !this.state.refresh, isFetching: false});
        });
        window.addEventListener('scroll',this.handleScroll)
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.handleScroll);
        this.selectedOptions = {}
    }

    async handleScroll(event){
        //if end of page is reached then fetch next user details
        if (this.state.isFetchingMoreUsers) {
            return
        }
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight*0.6) && this._controller.Users.length>0) {
            this.setState({isFetchingMoreUsers: true}, async () => {
                this.index = this.limit + this.index;
                await this._controller.fetchUsers(this.index, this.limit, this.state.userType, this.selectedOptions);
                this.setState({refresh: !this.state.refresh, isFetchingMoreUsers: false});
            });
        }
    }

    gotoAddUser=()=> {
        const {history} = this.props;
        history.push(RoutesUtility.CREATE_NEW_USER());
    }
    gotoProfile=(user)=> {
        const {history} = this.props;
        history.push(RoutesUtility.VIEW_PROFILE(user._id));
    }
    hideUser= async(user)=> {
        const userObj = {
            isHidden : true
        }
        const response = await this._controller.updateUser(user._id, userObj);
        if(response && response.body){
            this.setState({refresh: !this.state.refresh});
        }
    }
    unHideUser= async(user)=>{
        const userObj = {
            isHidden : false
        }
        const response = await this._controller.updateUser(user._id, userObj);
        if(response && response.body){
            this.setState({refresh: !this.state.refresh});
        }
    }

    handleUserFilter = async(selectedOptions)=>{
        this.selectedOptions = selectedOptions;
        let showDownload = UserType.PROSPECT === this.state.userType && Object.keys(selectedOptions).length > 0;
        this.setState({isFetching: true, isFilterApplied: false }, async()=>{
            this.index = 0;
            this.limit = 50;
            await this._controller.applyUserTableFilter(selectedOptions, this.index, this.limit, this.state.userType);
            showDownload = showDownload && this._controller.Users.length > 0;
            this.setState({refresh: !this.state.refresh, isFetching: false, isFilterApplied: showDownload });
        });
        
    }
    downloadUsers = async() => {
        if(this.state.isFilterApplied) {
            this.setState({isDownloading: true}, async()=>{
                const response = await this._controller.downloadProspectUsers(this.selectedOptions);
                if(response && response.data && response.data.filename) {
                    window.open(Settings.API_AUTH_BASE_URL +"/auth"+ response.data.filename);
                }
                this.setState({isDownloading:false});
            })
        }
    }
    
    sortUserTable = (key)=>{
        this._controller.sortData(key);
        this.setState({refresh: !this.state.refresh});
    }

    render() {
        
        return (
            <div className="users">
                <div className="breadcumbs">Users</div>
                <div className="filters-container">
                    <div className="add-button-container">
                        <button className="button" onClick={this.gotoAddUser}>
                            <FaPlus/> <span>Add</span>
                        </button>
                    </div>
                    <FilterAndSort 
                        userType={this.state.userType}
                        studyList={Utility.convertToDisplayInDropDown(this._controller.StudyList)} 
                        occupationList={Utility.convertStringArrayToDisplayInDropDown(this._controller.OccupationList)}
                        applyFilter={this.handleUserFilter}
                        showDownload={this.state.isFilterApplied}
                        disableDownload={this.state.isDownloading}
                        downloadProspectUsers={this.downloadUsers}>
                    </FilterAndSort>
                </div>
                {
                    !this.state.isFetching && <div className="users-count">
                        {this._controller.TotalUserCount === "-" ? <Loader/> : <h4>{`Users (${this._controller.TotalUserCount})`}</h4>}
                    </div>
                }
                <div className="user-directory">
                    {
                        this.state.isFetching ?
                            <Loader />
                            : <UserTable 
                                data={this._controller.Users} 
                                sortData={this.sortUserTable} 
                                viewProfileHandler={this.gotoProfile} 
                                hideUser={this.hideUser} 
                                unHideUser={this.unHideUser} />
                    }
                </div>
            </div>
        );
    }
}

export default Users;