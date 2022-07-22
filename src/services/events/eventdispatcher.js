// @flow
/**
 * @usage
 * yourclass extends EventDispatcher
 * instanceofyourclass.addEventListener('eventtpe',handler);
 * inside your class - dispatchEvent(new Event('eventtype',{}));
 * listener handler - handler(e:Event){data=e.data}
 */

import Event from './event';

let _arrListeners: Array<Object> = [];

let _checkEventExists = (type: string, handler: Function) => {
    let bIsExists: boolean = false;
    for(const item: Object of _arrListeners) {
        if(item.type == type && item.handler === handler) {
            bIsExists = true;
            break;
        }
    }
    return bIsExists;
}

 class EventDispatcher {

    static addEventListener(type: string, handler: Function): void {
        if(!_checkEventExists(type, handler)) {
            _arrListeners.push({
                type: type,
                handler: handler
            })
        }
    }

    static removeEventListener(type: string, handler: Function): void {
        let counter: number = 0;
        for(const item: Object of _arrListeners) {
            if(item.type == type && item.handler === handler) {
                _arrListeners.splice(counter, 1);
                counter++;
            }
        }
    }

    static dispatchEvent(event: Event) {
        for(const item: Object of _arrListeners) {
            if(item.type == event.type) {
                item.handler(event);
            }
        }
    }

    static getAllListeners(): Array<Object> {
        return _arrListeners;
    }
 }

 export default EventDispatcher;