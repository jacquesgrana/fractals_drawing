import UrlConfig from "../config/UrlConfig";
import { FavoriteShallow, Nullable } from "../types/indexType";
import SecurityService from "./SecurityService";


class FavoriteService {
    private static _instance: FavoriteService;

    private userFavorites: FavoriteShallow[] = [];

    private securityService = SecurityService.getInstance();

    public static getInstance(): FavoriteService {
        if (!FavoriteService._instance) {
            FavoriteService._instance = new FavoriteService();
        }
        return FavoriteService._instance;
    }

    private constructor() {
        this.userFavorites = new Array<FavoriteShallow>();
    }

    public initService = async (): Promise<void> => {
        if(!this.securityService.isAuthenticated()) {
            this.userFavorites = [];
            //console.log("not authenticated");
            return;
        }
        const response = await this.getUserFavoritesRequest();
        if (response) {
            if(response.status === 401) {
                console.log("401 : Unauthorized");
            }
            else if(response.status === 404) {
                console.log("404 : Resource not found");
            }
            else if(response.status === 200) {
                try {
                    const datas = await response.json();
                    const userFavoritesFromDb = datas.data.favorites;
                    // ✅ important : reset avant de remplir
                    this.userFavorites = [];

                    userFavoritesFromDb.forEach((favoriteFromDb: any) => {
                        const favorite: FavoriteShallow = 
                        {
                            id: favoriteFromDb.id,
                            userId: favoriteFromDb.user.id,
                            userPseudo: favoriteFromDb.user.pseudo,
                            juliaFractalId: favoriteFromDb.juliaFractal.id,
                            createdAt: favoriteFromDb.createdAt
                        };
                        this.userFavorites.push(favorite);
                    });
                    //console.log(this.userFavorites);
                } catch (error) {
                    console.error(error);
                }
            }
            else {
                console.log("status : " + response.status);
            }
            
        }
    }

    public isInUserFavorites = (juliaFractalId: number): boolean => {
        return (this.userFavorites.some(favorite => favorite.juliaFractalId === juliaFractalId));
    }

    public toggleFavorite = async (juliaFractalId: number): Promise<Nullable<Response>> => {
        try {
            const data = { "juliaFractalId": juliaFractalId };
            const response = await fetch(UrlConfig.FAVORITE_TOGGLE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }, 
                body: JSON.stringify(data)
            });
            return response;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    public getUserFavoritesRequest = async (): Promise<Nullable<Response>> => {
        try {
            const response = await fetch(UrlConfig.FAVORITE_GET_USER_FAVORITES_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    public getUserFavorites = (): FavoriteShallow[] => {
        return this.userFavorites;
    }
}

export default FavoriteService;