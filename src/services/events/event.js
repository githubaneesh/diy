// @flow
/**
 * @usage 
 * let myEvent = new Event('myeventtype',{});
 * dispatchEvent(myEvent);
 */

let _eventType: string;
let _data: any;

let initProperties = (type: string, data: any) => {
   _eventType = type;
   _data = data;
}

class Event {
   
   static CONNECTED: string = 'connected';
   static RECIEVED: string = 'recieved';
   static DISCONECTED: string = 'disconnected';
   
   constructor(type: string, data: any) {
       initProperties(type, data);
   }

   get type(): string {
       return _eventType;
   }

   get data(): any {
       return _data;
   }
}

export default Event;