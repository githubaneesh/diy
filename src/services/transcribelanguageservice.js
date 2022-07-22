import HttpService from "./httpservice";


let _singleton = true;
let _instance;

const _httpService = HttpService.instance;

export default class TranscribeLanguageService {

    static TRANSCRIBE_LANGUAGES (langCode) { return `/transcribelanguage/${langCode}`; }

    constructor(){
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use TranscribeLanguageService.instance instead!');
        }
    }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new TranscribeLanguageService();
            _singleton = true;
        }
        return _instance;
    }

    async getTranscribeLanguages(langCode="") {
        const requestUrl = TranscribeLanguageService.TRANSCRIBE_LANGUAGES(langCode);
        return await _httpService.requestV3Server(HttpService.GET, requestUrl, null);
    }

}
