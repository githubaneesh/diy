import { Messages } from "../../../../utility/Messages";
import NotifierService from "../../../../services/notifierService";

let _owner;
const _notifierService = NotifierService.instance;
class FilterSortController {

    filterValues = {};
    constructor(owner) {
        _owner = owner;
        this.timer = null;
    }

    validateFilterValues(selectedOptions){
        if(selectedOptions.user && selectedOptions.user.selectedAgeStart && selectedOptions.user.selectedAgeEnd){
            if(parseInt(selectedOptions.user.selectedAgeEnd) <  parseInt(selectedOptions.user.selectedAgeStart)){
                _notifierService.showMessage({error:true}, '', Messages.age_range_error);
                return true;
            }
        }
        if(selectedOptions.child && selectedOptions.child.selectedAgeStart && selectedOptions.child.selectedAgeEnd){
            if(parseInt(selectedOptions.child.selectedAgeEnd) <  (selectedOptions.child.selectedAgeStart)){
                _notifierService.showMessage({error:true}, '', Messages.age_range_error);
                return true;
            }
        }
        if (this.filterValues.user && Object.keys(this.filterValues.user).length === 0) {
            delete this.filterValues["user"];
        }
        if (this.filterValues.child && Object.keys(this.filterValues.child).length === 0) {
            delete this.filterValues["child"];
        }
        return false;
    }

    locationSearchChange = (key,location)=>{
        if(!this.filterValues.user) {
            this.filterValues["user"] = {}
        }
        this.filterValues.user[key] = location;
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    keywordSearchChange = (key, keyword) => {
        if(!this.filterValues.user) {
            this.filterValues["user"] = {}
        }
        this.filterValues.user[key] = keyword;
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    searchNameEmail = (event) => {
        const searchVal = event.target.value;
        if (searchVal) {
            this.filterValues["search"] = searchVal;
        }
        else {
            delete this.filterValues.search;
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(this.filterData, 500);
    }

    filterData = () => {
        _owner.props.applyFilter(this.filterValues);
    }

    clearLocationSearch =(key) =>{
        delete this.filterValues.user[key];
        if (this.filterValues.user && Object.keys(this.filterValues.user).length < 0) {
            delete this.filterValues["user"];
        }
        if (!this.validateFilterValues(this.filterValues)) {
            _owner.props.applyFilter(this.filterValues);
        }
    }

    clearKeywordSearch = (key) =>{
        delete this.filterValues.user[key];
        if (this.filterValues.user && Object.keys(this.filterValues.user).length < 0) {
            delete this.filterValues["user"];
        }
        if (!this.validateFilterValues(this.filterValues)) {
            _owner.props.applyFilter(this.filterValues);
        }
    }



    handleGenderFilterChange = (selectedGender)=>{
        if(!this.filterValues.user) 
            this.filterValues["user"] = {}
        this.filterValues.user["gender"] = selectedGender.value;
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleEthnicityFilterChange = (selectedEthnicity)=>{
        if(!this.filterValues.user) 
            this.filterValues["user"] = {}
        this.filterValues.user["ethnicity"] = selectedEthnicity.value;
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleStudyFilterChange = (selectedStudy)=>{
        if(!this.filterValues.user) 
            this.filterValues["user"] = {}
        this.filterValues.user["studies"] = selectedStudy.value;
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleClearGender = ()=>{
        delete this.filterValues.user["gender"];
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleClearEthnicity = ()=>{
        delete this.filterValues.user["ethnicity"];
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleChildFilterChange = (gender)=>{
        if(!this.filterValues.child){
            this.filterValues["child"] = {}
        }
        this.filterValues.child["gender"] = gender.value;
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleClearChildGender = ()=>{
        delete this.filterValues.child["gender"];
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleClearStudyFilter = ()=>{
        delete this.filterValues.user["studies"];
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleClearOccupationFilter = ()=>{
        delete this.filterValues.user["occupation"];
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleOccupationFilterChange = (selectedOccupation)=>{
        if(!this.filterValues.user) 
            this.filterValues["user"] = {}
        this.filterValues.user["occupation"] = selectedOccupation.value;
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleLuxuryFilter =(selectedLuxury)=>{
        if(!this.filterValues.user) 
            this.filterValues["user"] = {}
        this.filterValues.user["luxuryQualified"] = selectedLuxury.value === 'Yes';        
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleClearLuxuryFilter = ()=>{
        delete this.filterValues.user["luxuryQualified"];
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }


    handleFilterCheckbox = (key, event)=>{
        if(!this.filterValues.user){
            this.filterValues["user"] = {}
        }
        if(event.target.checked){
            this.filterValues.user[key] = event.target.checked;
        }
        else {
            delete this.filterValues.user[key];
        }
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleAgeRange = (key,event)=>{
        if(!this.filterValues.user) 
            this.filterValues["user"] = {}
        if(event.target.value){
            this.filterValues.user[key] = event.target.value;
        }
        else {
            delete this.filterValues.user[key];
        }
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
        
    }

    handleChildRange = (key, event)=>{
        if(!this.filterValues.child) 
            this.filterValues["child"] = {}
        if(event.target.value){
            event.target.value = event.target.value > 18 ? 18 : event.target.value;
            this.filterValues.child[key] = event.target.value;
        }
        else {
            delete this.filterValues.child[key];
        }
        if(!this.validateFilterValues(this.filterValues)){
            _owner.props.applyFilter(this.filterValues);
        }
    }

    handleDownload = () => {
        _owner.props.downloadProspectUsers()
    }
    
}

export default FilterSortController;