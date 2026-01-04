import UrlConfig from "../config/UrlConfig";
import { Nullable, UserRegister } from "../types/indexType";


class UserService {
    private static instance: UserService;

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }


    public register = async (userData: UserRegister): Promise<Nullable<Response>> => {
        try {
            const response = await fetch(UrlConfig.REGISTER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            return response;
        } 
        catch (err) {
            console.error(err);
            return null;
        }
    }
}

export default UserService;