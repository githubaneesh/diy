import React, { Component } from 'react';
import { FaPlus, FaMinus, FaDownload } from "react-icons/fa";
import './style.scss';
import FilterInput from '../filter-input';
import Dropdown from '../../../widgets/dropdown';
import Utility from '../../../../utility/Utility';
import FilterSortController from './filterSort';
import LocationSearchInput from '../location-search-input/index';
import Loader from '../../../widgets/loader';
import UserType from '../../../../common/userType';

class FilterAndSort extends Component {

    _controller;

    constructor() {
        super();

        this.state = {
            active: false,
            refresh: false
        }
        this.genderOptionsData = [{value:'unknown', label: 'Unknown'}, ...Utility.getGenderValues()];
        this._controller = new FilterSortController(this);
        this.clearGoogleLocation = this.clearGoogleLocation.bind(this);
    }
    toggle=()=> {
        this.setState({active: !this.state.active});
    }

    componentWillUpdate(prevProps){
        if(this.props.userType !== prevProps.userType){
            this._controller.filterValues = {};
            this.setState({active: false})
        }
    }
    hadlePlaceChange=(address)=> {
        this._controller.locationSearchChange("selectedLocation", address);
    }
    clearGoogleLocation() {
        this._controller.clearLocationSearch("selectedLocation");
    }
    
    render() {

        return (
            <div className="filter-and-sort">
                <div className="header">
                    <div className="title" onClick={this.toggle}>
                        {
                            this.state.active ? <span className="title-inner"><FaMinus /> <span>Hide</span></span>
                                : <div><FaPlus /> <span className="title-inner">Filtering & Sorting Options</span></div>

                        }
                    </div>

                    <div className="search">
                        <input placeholder="Search by name or email" onChange={this._controller.searchNameEmail}/>
                    </div>
                    <div className="clear-fix"></div>
                </div>
                {
                    this.state.active && (<div className="filter-and-sort-body">
                        <div className="title">Sort Options</div>
                        <div className="by-location">
                            <div className="filter-label">By Location</div>
                            <LocationSearchInput onPlaceChanged={this.hadlePlaceChange} clearLocation={this.clearGoogleLocation}></LocationSearchInput>
                        </div>
                        <div className="by-other-locations">
                            <div className="grid-item">
                                <div className="filter-label">By Country</div>
                                <FilterInput 
                                    searchKey="country" 
                                    placeholder="Any" 
                                    onValueChange={this._controller.locationSearchChange} 
                                    clearLocation={this._controller.clearLocationSearch} />
                            </div>
                            <div className="grid-item">
                                <div className="filter-label">By State</div>
                                <FilterInput 
                                    searchKey="state" 
                                    placeholder="Any" 
                                    onValueChange={this._controller.locationSearchChange} 
                                    clearLocation={this._controller.clearLocationSearch} />
                            </div>
                            <div className="grid-item">
                                <div className="filter-label">By City</div>
                                <FilterInput 
                                    searchKey="city" 
                                    placeholder="Any" 
                                    onValueChange={this._controller.locationSearchChange} 
                                    clearLocation={this._controller.clearLocationSearch} />
                            </div>
                        </div>
                        <div className="filters">
                            <div className="title">Filters</div>
                            <div className="filters-inner">
                                <div className="grid-item">
                                    <div className="filter-label">Gender</div>
                                    <Dropdown defaultOptionText=""
                                        clearable={true}
                                        optionsData={this.genderOptionsData}
                                        clearSelectedOption={this._controller.handleClearGender}
                                        onChangeHandle={this._controller.handleGenderFilterChange}
                                        placeholder={"Any"} />
                                </div>
                                <div className="grid-item">
                                    <div className="filter-label">Ethnicity</div>
                                    <Dropdown defaultOptionText=""
                                        clearable={true}
                                        optionsData={Utility.getEthnicityValues()}
                                        clearSelectedOption={this._controller.handleClearEthnicity}
                                        onChangeHandle={this._controller.handleEthnicityFilterChange}
                                        placeholder={"Any"} />
                                </div>
                                <div className="grid-item">
                                    <div className="filter-label">Study</div>
                                    <Dropdown defaultOptionText=""
                                        clearable={true}
                                        clearSelectedOption={this._controller.handleClearStudyFilter}
                                        optionsData={this.props.studyList}
                                        onChangeHandle={this._controller.handleStudyFilterChange}
                                        placeholder={"Any"} />
                                </div>
                                <div className="grid-item">
                                    <div className="filter-label">Age Range</div>
                                    <input type="number" min="10" max="99" onChange={(event) => { this._controller.handleAgeRange("selectedAgeStart", event) }} /> - <input type="number" min="10" max="99" onChange={(event) => { this._controller.handleAgeRange("selectedAgeEnd", event) }} />
                                </div>
                                <div className="grid-item">
                                    <div className="filter-label">Child Age Range</div>
                                    <input type="number" min="1" max="18" onChange={(event) => { this._controller.handleChildRange("selectedAgeStart", event) }} /> - <input type="number" min="1" max="18" onChange={(event) => { this._controller.handleChildRange("selectedAgeEnd", event) }} />
                                </div>
                            </div>
                        </div>
                        <div className="other-filters">
                            <div className="filters-inner">
                                <div className="grid-item">
                                    <div className="filter-label">Occupation</div>
                                    <Dropdown defaultOptionText=""
                                        clearable={true}
                                        optionsData={this.props.occupationList}
                                        clearSelectedOption={this._controller.handleClearOccupationFilter}
                                        onChangeHandle={this._controller.handleOccupationFilterChange}
                                        placeholder={"Any"} />
                                </div>
                                <div className="grid-item">
                                    <div className="filter-label">Luxury Qualified</div>
                                    <Dropdown defaultOptionText=""
                                        clearable={true}
                                        optionsData={Utility.getLuxuryQualifiedvalues()}
                                        clearSelectedOption={this._controller.handleClearLuxuryFilter}
                                        onChangeHandle={this._controller.handleLuxuryFilter}
                                        placeholder={"Any"} />
                                </div>
                                <div className="grid-item">
                                    <div className="grid-item-inner">
                                        <input type="checkbox" id="hidden" onClick={(event) => { this._controller.handleFilterCheckbox("isHidden", event) }} />
                                        <label className="filter-label" htmlFor="hidden">Only show hidden</label>
                                    </div>
                                </div>
                                <div className="grid-item">
                                    <div className="grid-item-inner">
                                        <input type="checkbox" id="superstar" onClick={(event) => { this._controller.handleFilterCheckbox("isStar", event) }} />
                                        <label className="filter-label" htmlFor="superstar">Show Superstar</label>
                                    </div>
                                </div>
                                <div className="grid-item">
                                    <div className="filter-label">Child Gender</div>
                                    <Dropdown defaultOptionText=""
                                        clearable={true}
                                        optionsData={Utility.getGenderValues()}
                                        onChangeHandle={this._controller.handleChildFilterChange}
                                        clearSelectedOption={this._controller.handleClearChildGender}
                                        placeholder={"Any"} />
                                </div>
                                <div className="grid-item last-row">
                                    <div className="filters-inner">
                                        <div className="grid-item">
                                            <div className="filter-label">Keyword</div>
                                            <FilterInput
                                                searchKey="keyword"
                                                placeholder="Any"
                                                onValueChange={this._controller.keywordSearchChange}
                                                clearLocation={this._controller.clearKeywordSearch} />
                                        </div>
                                        {
                                            (this.props.userType === UserType.PROSPECT)
                                            && <div className="grid-item download">
                                                <button className={(this.props.disableDownload || !this.props.showDownload) ? "button disable-button" : "button"} onClick={this._controller.handleDownload}>
                                                    {
                                                        this.props.disableDownload
                                                        && <span className="download_spinner"> <Loader /> </span>
                                                    }
                                                    <span className="btn-text">Download Results</span>
                                                </button>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    )
                }
             
            </div>
        );
    }
}

export default FilterAndSort;