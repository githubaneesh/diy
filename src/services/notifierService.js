import {toast } from 'react-toastify';
import { Messages } from '../utility/Messages';

let _singleton = true;
let _instance;

export default class NotifierService{
    toastId = null;
    constructor(){
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use NotifierService.instance instead!');
        }        
    }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new NotifierService();
            _singleton = true;
        }
        return _instance;
    }

    /**
     * Shows toast on screen.
     * @param {*} message  toast message 
     * @param {*} type 'info' | 'success' | 'warning' | 'error' | 'default'
     * @param {*} autoCloseTime default 4000
     * @param {*} toastOptions object of ToastOptions
     */
    
    showToast(message, type, toastOptions = {}){
       
        // clears all the existing toast messages on screen if exists before showing new
        if(this.toastId !== null) {
            toast.dismiss(this.toastId);
        }

        this.toastId = toast(message, {
            type:type,
            autoClose: '4000',
            className:`toast-${type}`
        });
    }

    getErrorMessage(error){
        const keys = ['E11000'];
        const errorKey = keys.find((key) => error.message.indexOf(key)!==-1)
        switch(errorKey) {
            case 'E11000':
                return Messages.study_exist;
                break;
            default:
                return error.error?error.message?error.message:Messages.error_occured:Messages.error_occured;
                break;
        }
    }    

    /**
     * 
     * @param {*} response API Response
     * @param {Boolean} onlyOnError show message only on error | Default true
     * @param {*} successMessagekey  Success Message Key
     * @param {*} autoCloseTime Toast Auto Close Time
     * @param {*} toastOptions Toast Options
     */
    showMessage(response, successMsg, errorMsg=''){
        if(response){
            if(response.error){
                const message = errorMsg.trim() !== '' ? errorMsg : this.getErrorMessage(response);
                this.showToast(message, 'error');
            }
            else {
                if(successMsg && successMsg.trim() !== '') {
                    this.showToast(successMsg, 'success');
                }
            }
        }
    }

}