import HttpService from "./httpservice";


let _singleton = true;
let _instance;

const _httpService = HttpService.instance;

export default class TranscribeService {

    constructor(){
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use TagService.instance instead!');
        }
    }

    static transcribeStatus() { return `/transcribe/jobStatus`}

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new TranscribeService();
            _singleton = true;
        }
        return _instance;
    }

    async getTranscribeStatus(videoData) {
        let data; 
        if(typeof videoData === "string" && !videoData["videoObjectKey"]){
            data = {"video": videoData};
        }
        else if (videoData.videoObjectKey || (videoData.video && videoData.video !== "")) {
            data = videoData.videoObjectKey ? { "videoObjectKey": videoData.videoObjectKey } : { "video": videoData.video };
        }
        if(!data || Object.keys(data).length === 0) {
            return null;
        }
        const requestUrl = TranscribeService.transcribeStatus();
        return _httpService.requestV3Server(HttpService.POST, requestUrl, data);
    }

}
