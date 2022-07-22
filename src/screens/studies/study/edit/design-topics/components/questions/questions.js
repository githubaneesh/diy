import MediaService from "../../../../../../../services/mediaservice";
import UtilityService from "../../../../../../../utility/Utility";
import QuestionaireService from "../../../../../../../services/questionaireService";
import NotifierService from "../../../../../../../services/notifierService";
import { Messages } from "../../../../../../../utility/Messages";
import TranscribeLanguageService from "../../../../../../../services/transcribelanguageservice";
import Utility from "../../../../../../../utility/Utility";

const _mediaService = MediaService.instance;
const _questionaireService = QuestionaireService.instance;
const _notifierService = NotifierService.instance;
const _transcribeLanguageService = TranscribeLanguageService.instance;

class QuestionsController {

    _owner;
    transcribeLangauges = [];

    constructor (owner) {
        this._owner = owner;
    }

    async getTranscribeLanguages () {
        const transcribeLanguageResponse = await _transcribeLanguageService.getTranscribeLanguages();
        if (!transcribeLanguageResponse.error) {
            this.transcribeLangauges = transcribeLanguageResponse.body;
        }
    }

    async onUpdateQuestionClick (questionData, topicId, value, selectedResponces, nextQuestionId, mediaFiles, extras = {}) {
        let media = [];
        if (mediaFiles && mediaFiles.length > 0) {
            await Promise.all( mediaFiles.map(async(file)=>{
                let imageToUpload;
                let videoToUpload;
                if(file && file.image){
                    
                    imageToUpload = file.image
                    const filename = Utility.createUniqueFileName(imageToUpload.name);
                    const response = await _mediaService.getSignedUrl(filename);
                    if (response.error) {
                        return;
                    }

                    const uploadFile = await _mediaService.uploadMedia(response.body, imageToUpload, imageToUpload.type);
                    // let mediaUrl = UtilityService.generateS3Url(signedUrl.body.url, imageToUpload.name);

                    let mediaObj = {};
                    mediaObj["imageObjectKey"] = filename;
                    // mediaObj["image"] = mediaUrl;

                    if(file && file.video){
                        videoToUpload = file.video;
                        const videofilename = Utility.createUniqueFileName(Utility.removeWhiteSpace(videoToUpload.name));
                        let videoSignedUrl = await _mediaService.getSignedUrl(Utility.removeWhiteSpace(videofilename));
                        if (videoSignedUrl.error) {
                            return;
                        }
                        await _mediaService.uploadMedia(videoSignedUrl.body, videoToUpload, videoToUpload.type);
                        // let videoUrl = UtilityService.generateS3Url(signedUrl.body.url, Utility.removeWhiteSpace(videoToUpload.name));
                        // mediaObj["video"] = videoUrl;
                        mediaObj["videoObjectKey"] = videofilename;
                    }

                    media.push(mediaObj)
                }
            }));
        }
        return await this._owner.props.saveQuestionHandler(questionData, topicId, value, selectedResponces, nextQuestionId, media, extras);
    }

    async deleteQuestionMedia(questionId, mediaId){
        const response = await _questionaireService.deleteQuestionMedia(questionId, mediaId);
        _notifierService.showMessage(response, Messages.media_delete, Messages.media_delete_failed);
        return response;
    }
    
}
export default QuestionsController;