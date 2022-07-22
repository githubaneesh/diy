import React, { Component } from 'react';
import CreatableSelect from 'react-select/creatable';

class DropdownCreatable extends Component {
    constructor (props) {
        super(props);
    
        this.state = {
          selectedOption: props.selected ? props.selected : null,
          isLoading: false
        };
        this.handleCreate = this.handleCreate.bind(this);
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
        if (this.props.selected !== prevProps.selected) {
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

      handleCreate(inputValue) {

          if(inputValue){
            this.setState({ isLoading: true }, async()=>{
                await this.props.createOption(inputValue);
                this.setState({isLoading: false})
            });
          }
      }

      formatCreateLabel = (inputValue)=>{
        return `Add ${inputValue}`;
      }

      filterOption = (option: Option,
        rawInput: string)=>{

          if(option.label.toLowerCase().indexOf(rawInput.toLowerCase())!== -1) {
            return true;
          }
          return false;
      }

      render() {
        const { selectedOption,  isLoading} = this.state;
        return (
            <div className="dropdown">
                <CreatableSelect
                    formatCreateLabel={this.formatCreateLabel}
                    createOptionPosition={"first"}
                    isClearable={this.props.clearable ? this.props.clearable : false}
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    placeholder={this.props.placeholder}
                    onChange={this.handleChange}
                    onCreateOption={this.handleCreate}
                   filterOption={this.filterOption}
                    options={this.props.optionsData}
                    value={selectedOption} />
            </div>
        );
      }
}

export default DropdownCreatable;