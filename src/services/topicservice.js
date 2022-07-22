import HttpService from "./httpservice";
let _singleton = true;
let _instance;
const _httpService = HttpService.instance;

class TopicService {
    constructor () {
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use TopicService.instance instead!');
        }
    }

    static ADD_TOPIC () { return `/diy/topic/create`; }
    static COPY_TOPIC_TO_GROUP() {return '/group/topic/copy'}
    static UPDATE_TOPIC(topic) { return `/diy/topic/update/${topic}`; }
    static UPDATE_PREREQUISITE(topic, group) { return `/diy/topic/prerequisite/update/${topic}/${group}`; }
    static TOPIC_REORDER() { return `/group/topic/reorder`}
    static DELETE_TOPIC(topic) { return `/topic/delete/${topic}`; }
    static TOPICS_BY_USERTYPE() { return `/study/topicsByUserType`; }

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new TopicService();
            _singleton = true;
        }
        return _instance;
    }

    async addTopic(postContent) {
        const requestUrl = TopicService.ADD_TOPIC();
        return await _httpService.requestV3Server( HttpService.POST, requestUrl, postContent);        
    }

    async deleteTopic(topic) {
        const requestUrl = TopicService.DELETE_TOPIC(topic);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, {});        
    }

    async copyTopicToGroup(postContent) {
        const requestUrl = TopicService.COPY_TOPIC_TO_GROUP();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);        
    } 

    async updateTopic(postContent, topic){
        const requestUrl = TopicService.UPDATE_TOPIC(topic);
         return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async updatePrerequisite(postContent, topic, group){
        const requestUrl = TopicService.UPDATE_PREREQUISITE(topic, group);
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async topicReorder(postContent){
        const requestUrl = TopicService.TOPIC_REORDER();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }

    async topicsByUserType(postContent) {
        const requestUrl = TopicService.TOPICS_BY_USERTYPE();
        return await _httpService.requestV3Server(HttpService.POST, requestUrl, postContent);
    }
}

export default TopicService;