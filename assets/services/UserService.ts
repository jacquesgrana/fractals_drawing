import UrlConfig from "../config/UrlConfig";
import { Nullable, UserEmail, UserEmailWithCode, UserParams, UserPassword, UserRegister } from "../types/indexType";


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

    // TODO : typer !

    public updateUserParams = async (userData: UserParams): Promise<Nullable<Response>> => {
        try {
            const response = await fetch(UrlConfig.UPDATE_USER_PARAMS_URL, {
                method: 'PATCH',
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

    public updateUserEmail = async (userData: UserEmail): Promise<Nullable<Response>> => {
        try {
            const response = await fetch(UrlConfig.UPDATE_USER_EMAIL_URL, {
                method: 'PATCH',
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

    public verifyNonUsedEmail = async (userData: UserEmail): Promise<Nullable<Response>> => {

        try {
            const response = await fetch(UrlConfig.GET_EMAIL_NOT_USED_URL, {
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

    public sendEmailWithCodeToEmail = async (userData: UserEmail): Promise<Nullable<Response>> => {
        try {
            const response = await fetch(UrlConfig.SEND_EMAIL_WITH_CODE_URL, {
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

    public verifyEmailCode = async (userData: UserEmailWithCode): Promise<Nullable<Response>> => {
        try {
            const response = await fetch(UrlConfig.VERIFY_EMAIL_CODE_URL, {
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

    public changePassword = async (userData: UserPassword): Promise<Nullable<Response>> => {
        try {
            const response = await fetch(UrlConfig.UPDATE_USER_PASSWORD_URL, {
                method: 'PATCH',
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