import React, { Component } from 'react';
import PrimaryDetails from '../primary-details';
import "./style.scss";
import RadioGroup from '../radio-group';
import Dropdown from '../../../widgets/dropdown/index';
import { FaPlus, FaSave } from "react-icons/fa";
import ChildDetails from '../child-details/index';
import DialogModal from '../../../widgets/dialog-modal/index';
import Upload from '../../../widgets/upload/index';
import Utility from '../../../../utility/Utility';
import Media from '../../../widgets/media/index';
import LocationSearchInput from '../../components/location-search-input/index';
import DropdownCreatable from '../../../widgets/dropdown-creatable';

class ProspectDetails extends Component {
    childrens = [];
    childCount = 0;
    childToRemove;
    _selectedFile;
    superstarAgreeList= [{value: "yes", label: "Yes", checked: false},{value: "no", label: "No", checked: true}];
    constructor(props) {
        super(props);
        this.state = {
            update: false,
            childAdded: false,
            showDeletePopup: false,
            refresh: false
        }
        this.prospectObj = props.data || {"isStar": false};
        if(this.prospectObj["isStar"]){
            this.superstarAgreeList[0].checked = true;
            this.superstarAgreeList[1].checked = false;
        }
        this.propspectImage = undefined;
        this.imageObjectKey = undefined;
        this.defaultOccupation = undefined;
        this.defaultEthnicity = undefined;
        this.childCount = 0;
    }

    componentDidUpdate(prevProps){
        if(this.props !== prevProps){
            if(Object.keys(this.props.data).length !== 0){
                this.prospectObj = this.props.data;
                this.childrens = this.props.child;
                this.childCount = 0;
                this.defaultOccupation = this.prospectObj["occupation"] ? {value: this.prospectObj["occupation"], label: this.prospectObj["occupation"]} : undefined;
                this.propspectImage =  this.prospectObj["profileImageUrl"] || this.prospectObj["profileImage"];
                this.imageObjectKey = this.prospectObj["imageObjectKey"];
                this.defaultEthnicity = this.prospectObj["ethnicity"] ? {"value" : this.prospectObj["ethnicity"], "label": Utility.titleCase(this.prospectObj["ethnicity"])} : undefined;
                this.setState({refresh: !this.state.refresh});
            }
        }
    }
    
    onSuperstartChange=(resp)=> {
        this.prospectObj["isStar"] = resp === 'yes';
    }
    onSave=()=> {
        this.props.prospectSave(this.prospectObj);
    }
    onAddChildren=()=> {
        let childObj = {"name": `Child ${this.childrens.length+1}`, "user": this.props.parentKey}
        this.childrens.push(childObj);
        this.props.childValueChange(this.childrens);
        this.setState({childAdded: true});
    }
    onRemoveChildren=(index)=> {
        this.childToRemove = index;
        this.setState({showDeletePopup: true});
    }
    handleRemove= async()=> {
        if(this.childToRemove !== undefined) {
            const children = this.childrens[this.childToRemove];
            if (children._id) {
                await this.props.deleteChild(children._id, this.childToRemove);
                this.childToRemove = undefined;
                this.setState({ childAdded: false, showDeletePopup: false });
            }
            else {
                this.childrens.splice(this.childToRemove, 1);
                this.childToRemove = undefined;
                this.props.childValueChange(this.childrens);
                this.setState({ childAdded: false, showDeletePopup: false });
            }
        }
    }
    closeDeletePopup = ()=>{
        this.setState({showDeletePopup: false});
    }
    uploadProspectImageHandler=(file)=> {
        this._selectedFile = file;
        var reader = new FileReader();
    
        reader.onload = function(e) {
            this.propspectImage = e.target.result;
            this.setState({update: true});
        }.bind(this);
        reader.readAsDataURL(this._selectedFile );
        this.prospectObj["userImage"] = this._selectedFile
        this.props.prospectFieldsChange(this.prospectObj);
    }
    handleDeleteImage = ()=> {
        this.propspectImage = "";
        this.imageObjectKey = "";
        this.prospectObj["imageObjectKey"]="";
        delete this.prospectObj["userImage"];
        this.props.prospectFieldsChange(this.prospectObj);
        this.setState({update: true});
    }

    inputChange = (event, key)=>{
        this.prospectObj[key] = event.target.value;
        this.props.prospectFieldsChange(this.prospectObj);
    }

    handleEthnicityFilterChange = (selectedEthnicity)=>{
        this.prospectObj["ethnicity"] = selectedEthnicity.value;
        this.props.prospectFieldsChange(this.prospectObj);
    }

    handleClearEthnicity = ()=>{
        delete this.prospectObj["ethnicity"];
        this.props.prospectFieldsChange(this.prospectObj);
    }

    handleOccupationChange = (selectedOccupation) =>{
        this.prospectObj["occupation"] = selectedOccupation.value;
        this.props.prospectFieldsChange(this.prospectObj);
    }

    handleClearOccupation = ()=>{
        delete this.prospectObj["occupation"];
        this.props.prospectFieldsChange(this.prospectObj);
    }

    fieldValueChange = (changedValues)=>{
        this.prospectObj = Object.assign(this.prospectObj, changedValues);
        this.props.prospectFieldsChange(this.prospectObj);
    }

    handleGroupSelect = (selectedGroup) =>{
        this.prospectObj["group"] = selectedGroup.value;
        this.props.prospectFieldsChange(this.prospectObj);
    }

    clearGroup = ()=>{
        delete this.prospectObj["group"];
        this.props.prospectFieldsChange(this.prospectObj);
    }

    childValuesChange = (fields, childIndex)=>{
        this.childrens[childIndex] =  Object.assign({}, fields);
        this.props.childValueChange(this.childrens)
    }

    luxuryChange = (event)=>{
        this.prospectObj["luxuryQualified"] = event.target.checked;
        this.props.prospectFieldsChange(this.prospectObj);
        this.setState({ refresh: !this.state.refresh });
    }
    paypalEmail = (event)=>{
        this.prospectObj["paypalEmail"] = event.target.value;
        this.props.prospectFieldsChange(this.prospectObj);
    }

    handlePlaceChange = (place) => {
        const location = place.split(',');
        delete this.prospectObj["state"];
        delete this.prospectObj["country"];
        delete this.prospectObj["city"];
        if (location.length === 3) {
            this.prospectObj["city"] = location[0];
            this.prospectObj["state"] = location[1];
            this.prospectObj["country"] = location[2];
        }
        else {
            if (location.length === 2) {
                this.prospectObj["state"] = location[0];
                this.prospectObj["country"] = location[1];
            }

            else if (location.length === 1) {
                this.prospectObj["country"] = location[0];
            }
        }
        this.props.prospectFieldsChange(this.prospectObj);
        this.setState({ refresh: !this.state.refresh })
    }

    clearLocation = () => {
        delete this.prospectObj["state"];
        delete this.prospectObj["country"];
        delete this.prospectObj["city"];
        this.props.prospectFieldsChange(this.prospectObj);
        this.setState({ refresh: !this.state.refresh })
    }

    render() {
        
        return (
            <div className="prospect-details">
                <div className="prospect-primary-details">
                    <div className="grid-item">
                        <PrimaryDetails 
                            userType={this.props.userType} 
                            parentKey={this.props.parentKey} 
                            phone={false} 
                            birthdate={true} 
                            gender={true} 
                            fieldValueChange={this.fieldValueChange} 
                            data={this.props.data} />
                    </div>
                    <div className="grid-item">
                        <div className="label">&nbsp;</div>
                        <div className="image-container">
                            {
                                (Utility.isValidUrl(this.propspectImage) || this.imageObjectKey) ?
                                    <Media 
                                        edit={true} 
                                        url={this.propspectImage}
                                        imageObjectKey={this.imageObjectKey}
                                        showStatus={false} 
                                        handleDelete={this.handleDeleteImage} />
                                    : <Upload
                                        onChangeHandler={this.uploadProspectImageHandler}
                                        type="image/png,image/jpeg"
                                        iconType="image"
                                        label="Upload Image" />
                            }
                        </div>
                    </div>
                </div>
                <div>
                    <div className="phone">
                        <div className="label">Phone</div>
                        <input type="text" onChange={(event)=>{this.inputChange(event, "phone")}} defaultValue={this.prospectObj["phone"]}/>
                    </div>
                    <div className="location">
                        <div className="label">Location:</div>
                        <LocationSearchInput onPlaceChanged={this.handlePlaceChange} clearLocation={this.clearLocation} />
                        <div className="other-location">
                            <div className="grid-item">
                                <div className="label">Country</div>
                                <input className="capitalize" type="text" readOnly={true} onChange={(event)=>{this.inputChange(event, "country")}} value={this.prospectObj.country ? this.prospectObj.country : '' }/>
                            </div>
                            <div className="grid-item">
                                <div className="label">State</div>
                                <input className="capitalize" type="text" readOnly={true} onChange={(event)=>{this.inputChange(event, "state")}} value={this.prospectObj.state ? this.prospectObj.state : ''}/>
                            </div>
                            <div className="grid-item">
                                <div className="label">City</div>
                                <input className="capitalize" type="text"  readOnly={true} onChange={(event)=>{this.inputChange(event, "city")}} value={this.prospectObj.city ? this.prospectObj.city : ''}/>
                            </div>
                        </div>
                    </div>
                    <div className="ethenic">
                        <div className="grid-item">
                            <div className="label">Ethnic Background</div>
                            <Dropdown defaultOptionText="" selected={this.defaultEthnicity}
                                clearable={true}
                                optionsData={Utility.getEthnicityValues()}
                                clearSelectedOption={this.handleClearEthnicity}
                                onChangeHandle={this.handleEthnicityFilterChange}
                                placeholder={""} />
                        </div>
                        <div className="grid-item">
                            <div className="label">Occupation</div>
                            <DropdownCreatable
                                defaultOptionText=""
                                selected={this.defaultOccupation}
                                clearable={true}
                                optionsData={this.props.occupations}
                                placeholder={""}
                                createOption={this.props.createOccupation}
                                clearSelectedOption={this.handleClearOccupation}
                                onChangeHandle={this.handleOccupationChange} />
                        </div>
                    </div>
                    <div className="luxury">
                        <div className="grid-item">
                            <div className="label">Luxury Qualified?</div>
                            <input type="checkbox" id="luxury" onChange={this.luxuryChange} checked={this.prospectObj.luxuryQualified}/>
                            <label htmlFor="luxury">Yes</label>
                        </div>
                        <div className="grid-item">
                            <div className="label">Superstar?</div>
                            <div className="gender-group">
                                <RadioGroup name="superstar" options={this.superstarAgreeList}
                                    changehandler={this.onSuperstartChange}>   
                                </RadioGroup>
                            </div>
                        </div>
                    </div>
                    <div className="paypal">
                        <div className="label">Paypal Email</div>
                        <input type="text" defaultValue={this.prospectObj.paypalEmail} onChange={this.paypalEmail}/>
                    </div>
                    <div className="add-children">
                        <div> 
                            <button className="button" onClick={this.onAddChildren}>
                                <FaPlus /> <span className="label">Add Children</span> 
                            </button>
                        </div>
                        <div className="children">
                            {
                                !!this.childrens && this.childrens.map((child, index) => {
                                    this.childCount += 1;
                                    return <ChildDetails key={`${index}-${this.childCount}`}
                                        childIndex={index}
                                        name={child.name}
                                        data={child}
                                        onRemove={this.onRemoveChildren}
                                        onValuesChange={this.childValuesChange} />
                                })
                            }
                        </div>
                    </div>
                    {
                        this.prospectObj["study"] && (
                            <div>
                                <div className="label">Select a study group</div>
                                <Dropdown defaultOptionText=""
                                    optionsData={this.props.groups}
                                    onChangeHandle={this.handleGroupSelect}
                                    clearable={true}
                                    clearSelectedOption={this.clearGroup}
                                    placeholder={""} />
                            </div>
                        )
                    } 
                </div>

                <DialogModal showModal={this.state.showDeletePopup} modalCloseHandler={this.closeDeletePopup} >
                    <div className="delete-tag-modal">
                        <div className="modal-header"><h3>Remove Child</h3></div>
                        <div className="modal-body">
                            <p>This is permanent and can't be undone! All information related to the child will be permanently lost.</p>
                        </div>
                        <div className="modal-footer text-right">
                            <div className="button-group">
                                <button className="button" onClick={this.closeDeletePopup}> Cancel </button>
                                <button className="button remove" onClick={this.handleRemove}> Remove</button>
                            </div>
                        </div>
                    </div>
                </DialogModal> 
            </div>
        );
    }
}

export default ProspectDetails;