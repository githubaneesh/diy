import React, { Component } from 'react';
import { FaRegWindowClose } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import Modal from 'react-modal';
import './style.scss';



class DialogModal extends Component { 
   
    componentDidMount() {
        Modal.setAppElement("#modalRoot");
    }

    shouldComponentUpdate(nextProps, nextState){
        if(nextProps.showModal === this.props.showModal && !nextProps.refresh){
            return false;
        }
        return true;
    }

    render() {
        return (
            <div id="modalRoot">
                <Modal
                    isOpen={this.props.showModal}
                    onRequestClose={this.props.modalCloseHandler}
                    shouldCloseOnOverlayClick={false}
                    ariaHideApp={false}
                    shouldCloseOnEsc={false}
                    className={this.props.className ? `modal ${this.props.className}` : 'modal' }
                    htmlOpenClassName="modal-content"
                    overlayClassName="overlay" >
                    <div className="modal-close"> 
                        <button onClick={this.props.modalCloseHandler}><MdClose size={28}/></button> 
                    </div>
                    <div>
                        {
                            this.props.children
                        }
                    </div>
                </Modal>                
            </div>
        );
    }
}

export default DialogModal;