import React, { Component } from 'react';
import { FaChevronDown, FaChevronRight, FaSearch, FaRegFileAlt, FaRegCopy } from "react-icons/fa";
import ReactDOM from 'react-dom';
import './style.scss';

class DropdownMenu extends Component {
    previousSelected = null;
    selectedSubMenu = null;
    dropDownData = [];

    constructor(props) {
        super(props);
        this.state = {
            showDropdown: false,
            change: false,
            refresh: false
        }
        this.subMenuClickHandler = this.subMenuClickHandler.bind(this);
    }
    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside, true);
    }
    
    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    }

    componentWillReceiveProps(){
      const { list } = this.props;
      this.dropDownData = this.copyMenus(list);
      this.selectedSubMenu = null;
    }
    
    handleClickOutside = event => {
        const domNode = ReactDOM.findDOMNode(this);
        //const target = document.getElementById('dropdownList');
        //console.log(target, event.target)
        if (!domNode || !domNode.contains(event.target)) {
            this.setState({showDropdown: false});
            this.dropDownData.forEach((item, index) => {
                item.active = false;
            });
        }
    }

    menuClickHandler(menuItem) {
        if(this.previousSelected && this.previousSelected !== menuItem) {
            this.previousSelected.active = false;
        }
        menuItem.active =  !menuItem.active;
        this.previousSelected = menuItem;
        this.setState({change: !this.state.change});
    }
    subMenuClickHandler(menuItem, subMenu) {
        if(this.previousSelected && this.previousSelected !== menuItem) {
            this.previousSelected.active = false;
        }
        menuItem.active =  !menuItem.active;
        this.previousSelected = menuItem;
        this.setState({change: !this.state.change});
        this.showMenu();
        this.selectedSubMenu = subMenu;
        this.props.onSubMenuSelection({id: this.selectedSubMenu.value, name:this.selectedSubMenu.title });
    }

    handleSearch = (text, menuItem)=>{

      this.props.list.some((data)=>{
        if(data.title === menuItem.title){
          menuItem.submenu = [...data.submenu];
            return true;
        }
      })

      if(text && text!== ''){
        text = text.toLowerCase();
        let filteredSubMenus = menuItem.submenu.filter((item)=>item.title.toLowerCase().startsWith(text));
        if(filteredSubMenus.length > 0){
          menuItem.submenu =  filteredSubMenus;
        }
      }
      this.setState({refresh: !this.state.refresh})
    }

    getMenuItem = (menuItem, index) => { 
      if (menuItem.submenu && menuItem.submenu.length > 0) {
        return (
          <li key={`menu-${index}`}>
            <div  onClick={()=>this.menuClickHandler(menuItem)}>
              { menuItem.title === "Previous Study" && <FaRegCopy />}
              <span className="menu-title">{menuItem.title}</span>
              <span className="icon-right"><FaChevronRight/></span>
            </div>
            <div className={menuItem.active? "content content-active" : "content"}>
            <ul>
              <li> <span><FaSearch/></span> <input className="search-input" type="text" onChange={(e)=>this.handleSearch(e.target.value, menuItem)} /></li>
              {
                  menuItem.submenu.map((subItem, subIndex)=> {
                      return  <li key={`submenu-${subIndex}`} onClick={()=>this.subMenuClickHandler(menuItem, subItem)}>
                                { menuItem.title === "Previous Study" && <FaRegFileAlt cursor="pointer" /> }
                                <span className="submenu-title"> {subItem.title} </span>
                              </li>
                  })
              }
            </ul></div>
          </li>
        );
      } else {
        return <li key={index}>{menuItem.title}</li>;
      }
    };

    showMenu() {
        this.dropDownData.forEach((item, index) => {
        item.active = false;
        });
        this.setState({showDropdown: !this.state.showDropdown});
    }

    copyMenus = (arr)=>{
      let menus = [];
      arr.map((a, index)=>{
        let subMenus = Object.assign([], a.submenu)
        menus[index] = {title: a.title, submenu : [...subMenus], active: false};
      });
      return menus;
    }

    render () {
      
      const {disabled} = this.props;

        return (
          <div className={this.state.showDropdown?"dropdown-menu dropdown-active" : "dropdown-menu"}>
              <div className={disabled ? "dropdown-wrapper dropdown-disabled" : "dropdown-wrapper"}>
                <span className="head" onClick={() => this.showMenu()}>
                  <span>{this.selectedSubMenu ? this.selectedSubMenu.title : "Copy from..."}</span>
                  <span className="icon"><FaChevronDown /></span>
                  <span className="clear-fix"></span>
                </span>
                <ul id="dropdownList" className="dropdown-list">
                  {
                    this.dropDownData.map((item, index) => {
                      return this.getMenuItem(item, index);
                    })
                  }
                </ul>
              </div>
          </div>);
    };
  }
  
  export default DropdownMenu;