import React, { Component } from 'react';
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

class Tab extends Component {
    editClickHandler =()=> {
        this.props.editClickHandler(this.props.id);
    }
    render(){
  	return (
      <div className="tab">
        <div className="title flex">
          <div
            className="title-inner"
            onClick={() => {
              this.props.handleclick(this.props.id);
            }}
          >
            <span className="space-right">
              {this.props.active ? (
                <FaChevronUp size={18} />
              ) : (
                <FaChevronDown size={18} />
              )}
            </span>
              <span>{this.props.index}. {this.props.title}</span>
          </div>
          {this.props.active ? (
            <span className="options" onClick={this.editClickHandler}>
              Edit Topic {this.props.editActive ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          ) : null}
        </div>
        <div>
          <span></span>
        </div>
        <div className={this.props.active ? "content show" : "content hide"}>
          {this.props.children}
        </div>
      </div>
    );      
    }
}

export default Tab;