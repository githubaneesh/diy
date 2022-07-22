export default class Settings {
    static enviorment = "qa"; //local, live

    static get API_AUTH_BASE_URL() {
        switch(this.enviorment) {
            case "local":
                return "http://192.168.43.34:4005";
            case "qa" :
                return "https://qa-auth.looklook-app.com";
            case "live":
                return "https://api-auth.looklook-app.com";
            default:
                return "http://192.168.7.228:3002";
        }

    }

    static get API_V3_BASE_URL() {
        switch(this.enviorment) {
            case "local":
                return "http://192.168.43.34:3002";
            case "qa" :
                return "https://qa-apiv3.looklook-app.com";
            case "live":
                return "https://apiv3.looklook-app.com";
            default:
                return "http://192.168.7.228:3002";
        }

    }
    static get API_V3 () {
        return `${this.API_V3_BASE_URL}/api/v3`;
    }

    static get API_V1_BASE_URL() {
        switch(this.enviorment) {
            case "local":
                return "http://192.168.43.34:3000";
            case "qa" :
                return "https://qa-api.looklook-app.com";
            case "live":
                return "https://api.looklook-app.com";
            default:
                return "https://qa-api.looklook-app.com";
        }
        
    }

    static get API_BASE_URL() {
        return `${this.API_V1_BASE_URL}/api`;
    }

    static TagListFileUrl(filePath){
        const apiUrl = this.API_BASE_URL.substring(0, this.API_BASE_URL.lastIndexOf("/api"));
        return `${apiUrl}/${filePath}`;
    }

}