import React, { Component } from "react";
import DisplayImage from "../../widgets/display-image";
import "./style.scss";
import { FaUser, FaPencilAlt } from "react-icons/fa"
import StudyService from '../../../services/studyService';
class StudyCard extends Component {
    _studyService = StudyService.instance;

    constructor(props) {
        super(props);

        this.state = {
            isHide: this.props.study.isHide
        }
    }
    handleHideAndUnhideStudy=async()=> {
        const response = await this._studyService.updateStudy(this.props.study._id, {isHide: !this.state.isHide});
        if(response) {
            this.setState({isHide: response.body.isHide});
        }
    }

    render () {
        return (
            <div className={"card-container"}>
                <div className={"card-wrapper"} style={{display:(!this.props.study.isHide && this.state.isHide)?"none":"flex"}}>
                    <div className={"left-panel"}>
                        <DisplayImage imageObjectKey={this.props.imageObjectKey} url={this.props.brandImage}/>
                    </div>
                    <div className={"right-panel"}>
                        <div className={"row1"}>
                            <div>
                                <div onClick={this.props.onStudyClicked}>
                                    <span className="study-name">{this.props.name}</span>
                                </div>
                                {
                                    this.props.translatedName && <div onClick={this.props.onStudyClicked}>
                                        <span className="study-name">{this.props.translatedName}</span>
                                    </div>
                                }
                            </div>
                            <button className="button" onClick={this.props.onTranslateClicked}>
                                <span>{"Translate"}</span>
                            </button>
                        </div>
                        {
                            this.props.isArchive &&  <div className="row2">
                                <div className="hidden-text">                            
                                    <label className="" htmlFor="hidden">{this.state.isHide?"Hidden":"Hide"}</label>
                                            <input type="checkbox" id="hidden" onChange={this.handleHideAndUnhideStudy} checked={this.state.isHide} />
                                    </div>                            
                            </div>
                        }
                      
                        {
                            (this.props.description || this.props.translateddescription) && <div className={"row3"}>
                                <p>
                                    {
                                        this.props.description
                                    }
                                </p>
                                {this.props.translateddescription && <p className={"translated"}>{this.props.translateddescription}</p>}
                            </div>
                        }
                        <div className={"row4"}>
                            <ul>
                                <li><FaUser />&nbsp;{this.props.participantCount}</li>
                                <li>{this.props.client}</li>
                                <li><span className="study-date"></span>{this.props.date}</li>
                                {this.props.edit &&<li>
                                    <button className="button" onClick={this.props.onEditClicked}>
                                        <FaPencilAlt/> <span>{"Edit"}</span>
                                    </button>
                                </li> }
                            </ul>
                            {
                                this.props.isAdmin && <span className="study-type-change" onClick={this.props.onArchiveUnarchiveStudy}>
                                    {this.props.archiveUnarchiveText}
                                </span>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default StudyCard;