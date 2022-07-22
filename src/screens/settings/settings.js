import UserService from "../../services/userservice";
import CookieService from "../../services/cookieservice";

const _userService = UserService.instance;
const _cookieService = CookieService.instance;

class SettingsController {

    async getUserDetails(user) {
        const response = await _userService.getUserDetails(null);
        return response;
    }

    async updateUserPassword(newPassword, userId){
        const postContent = {password : newPassword};
        const response = await _userService.updateUser(userId, postContent);
        return response;
    }

    clearUserData(){
        _cookieService.clearAll()
    }

}

export default SettingsController;