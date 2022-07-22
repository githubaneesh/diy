import React, { Component } from 'react';
import './style.scss';
import Select from 'react-select';

class Dropdown extends Component {
  
  constructor (props) {
    super(props);

    this.state = {
      selectedOption: props.selected ? props.selected : null,
    };
  }

  validiateChange (newData, oldData) {
    if (newData.length != oldData.length) {
      return true;
    }
    const newIds = newData.map(i=>i.value+"");
    const oldIds = oldData.map(i=>i.value+"");
    for (let id of newIds) {
      if (oldIds.indexOf(id+"") == -1) {
        return true;
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.validiateChange(this.props.optionsData, prevProps.optionsData)) {
      this.setState({
        selectedOption: null
      })
    }
    if (this.props.selected && this.props.selected !== this.state.selectedOption) {
        this.setState({
          selectedOption: this.props.selected
        })
    }
  }

  handleChange = selectedOption => {
    if(selectedOption === null) {
      if(this.props.clearSelectedOption){
        this.props.clearSelectedOption()
      }
      this.setState({selectedOption: null})
      return;
    }
    else if((this.state.selectedOption && this.state.selectedOption.value === selectedOption.value)){
      return;
    }
    this.setState(
      { selectedOption },
      () => this.props.onChangeHandle(this.state.selectedOption)
    );
  };

  render() {
    const { selectedOption } = this.state;
    return (
      <div className="dropdown">
        <Select
          isDisabled={this.props.disabled ? this.props.disabled : false}
          value={selectedOption}
          isClearable={this.props.clearable ? this.props.clearable : false}
          onChange={this.handleChange}
          options={this.props.optionsData}
          placeholder={this.props.placeholder} />        
      </div>
    );
  }
}

export default Dropdown;