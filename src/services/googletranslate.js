import HttpService from "./httpservice";
//TODO: replace with .env key
const apiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_KEY;//"AIzaSyCYxoNiRlH4oOqH1h_j5JOfLAx1s8-S9eo";
// const googleTranslate = require("google-translate")(process.env.REACT_APP_GOOGLE_TRANSLATE_KEY);
let _singleton = true;
let _instance;
const rootUrl = "https://translation.googleapis.com/language/translate/v2";
const _httpService = HttpService.instance;
const defaultLanguageCode = "en";

class GoogleTranslateService {
    constructor(){
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use GoogleTranslateService.instance instead!');
        }
    }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new GoogleTranslateService();
            _singleton = true;
        }
        return _instance;
    }
    // , sourceLanguageCode, destinationLanguageCode
    async translate(text, detectedLang, targetLang = "en") {
        let dataSend = {
            'q': text,
            "format":"text"
        }
        let url = `${rootUrl}?client=gtx&key=${apiKey}&sl=${detectedLang}&target=${targetLang}&dt=t}`;
        const response = await _httpService.requestGoogleServer(HttpService.POST, url, dataSend)
        if (response.error) {
            return {
                error: true,
                message: response.error.message
            };
        }
        return {
            error: false,
            body: response.data.translations
        };
    }

    async detectLanguage (text) {
        let dataSend = {
            'q': text,
            "format":"text"
        }
        let urlDetect = `${rootUrl}/detect?client=gtx&key=${apiKey}`;
        const response = await _httpService.requestGoogleServer(HttpService.POST, urlDetect, dataSend);
        if (response.error) {
            return {
                error: true,
                message: response.error.message
            };
        }
        if(response.data){
            return {
                error: false,
                body: {language: response.data.detections[0][0].language, isReliable: false}
            };
        }
    }

    async translateToDefault (text) {
        const detectedLanguage = await this.detectLanguage(text);
        if (detectedLanguage.err) {
            return detectedLanguage;
        }
        let response;
        if (detectedLanguage.body && detectedLanguage.body.language) {
            response = [];
            if (detectedLanguage.body.language === defaultLanguageCode) {
                response.push({
                    translatedText: undefined
                });
            } else {
                const translated = await this.translate(text, detectedLanguage.body.language);
                if (translated.error || translated.body[0].detectedSourceLanguage === defaultLanguageCode) {
                    response.push({
                        translatedText: undefined
                    }); 
                } else {
                    response.push({
                        translatedText:translated.body[0].translatedText, 
                        detectedSourceLanguage: translated.body[0].detectedSourceLanguage
                    });
                }
            }
        } else {
            const translated = await this.translate(text, detectedLanguage.body.language);
            return translated;
        }
        return {
            error: false,
            body: response
        }
    }

}

export default GoogleTranslateService;