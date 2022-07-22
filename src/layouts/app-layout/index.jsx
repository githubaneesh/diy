import React, { Component } from 'react';
import './style.scss';
import Footer from '../../components/footer';
import Header from '../../components/header';

class AppLayout extends Component {
  render () {
    return (
        <div className='main-container'>
          <Header {...this.props}/>
          <div className="body-container">
                <div className="body-inner">
                {
                    this.props.children
                }
                </div>
          </div>
          <Footer />
        </div>
      )
  }

}

export default AppLayout;
