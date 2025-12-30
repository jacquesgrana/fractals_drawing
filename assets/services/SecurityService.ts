import { UserLogin, UserInfo, Nullable } from "../types/indexType";


class SecurityService {

    private LOGIN_URL = '/api/login';
    private LOGOUT_URL = '/api/logout';
    private ME_URL = '/api/me';
    private static instance: SecurityService;

    private user: UserInfo | null = null;

    private _isAuthenticated: boolean = false;

    // Liste des souscripteurs de l'authentification : tableau de callback
    private subscribers: Array<(user: UserInfo | null) => void> = [];

    private constructor() {}

    public static getInstance(): SecurityService {
        if (!SecurityService.instance) {
            SecurityService.instance = new SecurityService();
        }
        return SecurityService.instance;
    }

    public onLoad(): void {
        //console.log("onLoad");
        //console.log('isAuthenticated', this.localStorageService.getIsAuthenticated());
        /*
        if(this.localStorageService.getIsAuthenticated() === true) {
            this._isAuthenticated = true;
            this.loadLocalStorageDatas();
        }
        */
        //this.isAuthenticated = th
    }

    public login = async (loginData: UserLogin): Promise<Response | null> => {
        try {
            const response = await fetch(this.LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            if(response.ok) {
                this.setIsAuthenticated(true);
                this.setUser(await response.json());
                this.notifySubscribers();
                // TODO observers notifiés
                //console.log('user : ', this.getUser());
            }

            /*
            if (response.ok) {
                // Connexion réussie (Code 200)
                console.log('Login success !');
                // ICI: Rediriger l'utilisateur, par exemple :
                window.location.href = '/'; 
            } else {
                // Erreur (Code 401 par exemple)
                //setError('Email ou mot de passe incorrect.');
            }
            */
            return response;
        } 
        catch (err) {
            //setError('Une erreur est survenue lors de la connexion.');

            console.error(err);
            return null;
        }
    }

    public logout = async () => {
        try {
            const response = await fetch(this.LOGOUT_URL, {
                method: 'POST'
            });
            if (response.ok) {
                this.setIsAuthenticated(false);
                this.setUser(null);
                this.notifySubscribers();
            }
            return response;
        } 
        catch (err) {
            console.error(err);
            return null;
        }
    }

    public me = async (): Promise<Nullable<Response>> => {
        try {
            const response = await fetch(this.ME_URL, {
                method: 'GET'
            });
            if (response.status === 200) {
                this.setIsAuthenticated(true);
                const data = await response.json();
                this.setUser(data.user);
                this.notifySubscribers();
            }
            else {
                this.setIsAuthenticated(false);
                this.setUser(null);
                this.notifySubscribers();
            }
            return response;
        } 
        catch (err) {
            console.error(err);
            return null;
        }
    }

    public subscribe(callback: (user: UserInfo | null) => void): () => void {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    public unsubscribe(callback: (user: UserInfo | null) => void): void {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    }

    private notifySubscribers(): void {
        this.subscribers.forEach(callback => callback(this.user));
    }

    public isAuthenticated = () => {
        return this._isAuthenticated;
    }

    public getUser = () => {
        return this.user;
    }

    public setIsAuthenticated = (isAuthenticated: boolean) => {
        this._isAuthenticated = isAuthenticated;
    }

    public setUser = (user: UserInfo | null) => {
        this.user = user;
    }
}

export default SecurityService;