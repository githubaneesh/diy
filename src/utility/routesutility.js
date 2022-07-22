import UserType from '../common/userType';

export default class RoutesUtility {
    static CREATE_NEW_STUDY () {
        return "/study/create/new";
    }

    static SETUP_STUDY (study) {
        return `/study/${study}/edit/${this.STUDY_TABS.SET_UP_STUDY}`;
    }

    static BACK_TO_STUDY (study, userType) {
        if(userType && userType.trim().toLowerCase() === UserType.CLIENT_ADMINISTRATOR) {
            return `/client/${study}`;
        }
        else {
            return `/studies/${study}`;
        }
    }

    static STUDIES() {
        return '/studies';
    }
    static STUDY_VIEW (study) {
        return `/study/${study}`;
    }

    static PARTICIPANT_PROFILE(participantId) {
        return `/participant/${participantId}`;
    }

    static PRINT_PARTICIPANT_POSTS(participantId) {
        return `/print/posts/participant/${participantId}`;
    }

    static VIEW_PROFILE(userId){
        return `/users/${userId}`;
    }

    static EDIT_USER(userId) {
        return `${userId}/edit`;
    }

    static CREATE_NEW_USER() {
        return `/users/create/new`;
    }

    static LOGIN() {
        return `/login`
    }

    static RESET_PASSWORD() {
        return `/reset-password`
    }

    static SETTINGS(){
        return `/settings`
    }
    
    static DESIGN_TOPICS (study, group = undefined) {
        if (group) {
            return `/study/${study}/edit/${this.STUDY_TABS.DESIGN_TOPICS}/${group}`
        }
        return `/study/${study}/edit/${this.STUDY_TABS.DESIGN_TOPICS}`
    }

    static USERS_LIST_ALL() {
        return '/users/list/all';
    }

    static USERS_LIST_PROSPECT() {
        return '/users/list/prospect';
    }

    static get STUDY_TABS () {
        return {
            "SET_UP_STUDY": "set-up-study",
            "DESIGN_TOPICS": "design-topics",
            "CREATE_SCREENER": "create-screener"
        }
    }
}