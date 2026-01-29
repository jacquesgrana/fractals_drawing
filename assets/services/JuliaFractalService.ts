import UrlConfig from "../config/UrlConfig";
import { ComplexNb } from "../model/ComplexNb";
import { JuliaFractal } from "../model/JuliaFractal";
import { Nullable, SortOption } from "../types/indexType";
import SecurityService from "./SecurityService";


class JuliaFractalService {

    private publicJuliaFractals: JuliaFractal[] = [];
    private userJuliaFractals: JuliaFractal[] = [];
    private securityService = SecurityService.getInstance();

    private static instance: JuliaFractalService;
    public static getInstance(): JuliaFractalService {
        if (!JuliaFractalService.instance) {
            JuliaFractalService.instance = new JuliaFractalService();
        }
        return JuliaFractalService.instance;
    }

    private constructor() {
        this.publicJuliaFractals = new Array<JuliaFractal>();
        this.userJuliaFractals = new Array<JuliaFractal>();
        //this.initService();
    }

    public initService = async (): Promise<void> => {
        const response = await this.getPublicFractals();
        if (response) {
            this.publicJuliaFractals = [];
            try {
                const datas = await response.json();
                const juliaFractalsFromDb = datas.data.juliaFractals;

                juliaFractalsFromDb.forEach((juliaFractalFromDb: any) => {
                    const juliaFractal = new JuliaFractal(
                        juliaFractalFromDb.id,
                        juliaFractalFromDb.name,
                        juliaFractalFromDb.comment,
                        new ComplexNb(true, juliaFractalFromDb.seedReal, juliaFractalFromDb.seedImag),
                        juliaFractalFromDb.escapeLimit,
                        juliaFractalFromDb.maxIterations,
                        juliaFractalFromDb.isPublic,
                        juliaFractalFromDb.createdAt,
                        juliaFractalFromDb.updatedAt,
                        juliaFractalFromDb.favoritesCount  
                    );
                    if(juliaFractalFromDb.user) juliaFractal.setUser(juliaFractalFromDb.user);
                    this.publicJuliaFractals?.push(juliaFractal);
                })
            } 
            catch (err) {
                console.error(err);
            }
        } 
        else {
            console.error('Pas de response');
        }

        //console.log('authenticated : ', this.securityService.isAuthenticated());
        
        if(!this.securityService.isAuthenticated()) {
            this.userJuliaFractals = [];
            return;
        }
        const response2 = await this.getUserFractals();
        if (response2) {
            this.userJuliaFractals = [];

            if(response2.status === 200) {
               try {
                    const datas = await response2.json();
                    const juliaFractalsFromDb = datas.data.juliaFractals;

                    juliaFractalsFromDb.forEach((juliaFractalFromDb: any) => {
                        const juliaFractal = new JuliaFractal(
                            juliaFractalFromDb.id,
                            juliaFractalFromDb.name,
                            juliaFractalFromDb.comment,
                            new ComplexNb(true, juliaFractalFromDb.seedReal, juliaFractalFromDb.seedImag),
                            juliaFractalFromDb.escapeLimit,
                            juliaFractalFromDb.maxIterations,
                            juliaFractalFromDb.isPublic,
                            juliaFractalFromDb.createdAt,
                            juliaFractalFromDb.updatedAt,
                            juliaFractalFromDb.favoritesCount
                        );
                        juliaFractal.setUser(juliaFractalFromDb.user);
                        //console.log(juliaFractal);
                        this.userJuliaFractals?.push(juliaFractal);
                    })
                } 
                catch (err) {
                    console.error(err);
                } 
            }
            
        } 
        else {
            console.error('Pas de response');
        }
    }

    public addJuliaFractalToUserList = async (juliaFractal: JuliaFractal): Promise<Response> => {
        const data = {
            "juliaFractalId": juliaFractal.getId()
        }
        //console.log(data);
        try {
                const response = await fetch(UrlConfig.JULIA_FRACTAL_ADD_TO_USER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(data)
            });
            return response;
        }
        catch (err) {
            console.error(err);
            return new Response("Erreur du serveur", { status: 500 });
        }
        
    }

    public createJuliaFractal = async (juliaFractal: JuliaFractal): Promise<Response> => {
        try {
            const datas = {
                "name": juliaFractal.getName(),
                "comment": juliaFractal.getComment(),
                "seedReal": juliaFractal.getSeed().getReal(),
                "seedImag": juliaFractal.getSeed().getImag(),
                "escapeLimit": juliaFractal.getLimit(),
                "maxIterations": juliaFractal.getMaxIt(),
                "isPublic": juliaFractal.getIsPublic()
            }
            const response = await fetch(UrlConfig.JULIA_FRACTAL_CREATE_TO_USER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(datas)
            });
            return response;
        }
        catch (err) {
            console.error(err);
            return new Response("Erreur du serveur", { status: 500 });
        }
    }

    public updateJuliaFractal = async (juliaFractal: JuliaFractal): Promise<Response> => {
        try {
            const datas = {
                "juliaFractalId": juliaFractal.getId(),
                "name": juliaFractal.getName(),
                "comment": juliaFractal.getComment(),
                "seedReal": juliaFractal.getSeed().getReal(),
                "seedImag": juliaFractal.getSeed().getImag(),
                "escapeLimit": juliaFractal.getLimit(),
                "maxIterations": juliaFractal.getMaxIt(),
                "isPublic": juliaFractal.getIsPublic()
            }
            const response = await fetch(UrlConfig.JULIA_FRACTAL_UPDATE_TO_USER_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(datas)
            });
            return response;
        }
        catch (err) {
            console.error(err);
            return new Response("Erreur du serveur", { status: 500 });
        }
    }

    public deleteUserJuliaFractal = async (juliaFractal: JuliaFractal): Promise<Response> => {
        const data = {
            "juliaFractalId": juliaFractal.getId()
        }
        //console.log(data);
        try {
                const response = await fetch(UrlConfig.JULIA_FRACTAL_DELETE_FROM_USER_URL, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(data)
            });
            return response;
        }
        catch (err) {
            console.error(err);
            return new Response("Erreur du serveur", { status: 500 });
        }
    }

    public getPublicFractals = async (): Promise<Response> => {
        try {
           const response = await fetch(UrlConfig.JULIA_FRACTAL_GET_PUBLIC_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json' 
            }
            });
            return response; 
        }
        catch (err) {
            console.error(err);
            return new Response("Erreur du serveur", { status: 500 });
        }
    }

    public getUserFractals = async (): Promise<Response> => {
        try {
           const response = await fetch(UrlConfig.JULIA_FRACTAL_GET_FROM_CURRENT_USER_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json' 
            }
            });
            return response; 
        }
        catch (err) {
            console.error(err);
            return new Response("Erreur du serveur", { status: 500 });
        }
    }

    setPublicJuliaFractals(juliaFractals: JuliaFractal[]): void {
        this.publicJuliaFractals = juliaFractals;
    }

    getPublicJuliaFractals(): JuliaFractal[] {
        return this.publicJuliaFractals;
    }

    setUserJuliaFractals(juliaFractals: JuliaFractal[]): void {
        this.userJuliaFractals = juliaFractals;
    }

    getUserJuliaFractals(): JuliaFractal[] {
        return this.userJuliaFractals;
    }

    public static sortListByOption(juliaFractals: JuliaFractal[], option: SortOption): void {
        switch (option) {
            case 'NAME_ASC':
                juliaFractals.sort((a, b) => a.getName().localeCompare(b.getName()));
                break;
            case 'NAME_DESC':
                juliaFractals.sort((a, b) => b.getName().localeCompare(a.getName()));
                break;
            case 'CREATION_RECENT':
                juliaFractals.sort((a, b) => new Date(b.getCreatedAt()).getTime() - new Date(a.getCreatedAt()).getTime());
                break;
            case 'CREATION_OLD':
                juliaFractals.sort((a, b) => new Date(a.getCreatedAt()).getTime() - new Date(b.getCreatedAt()).getTime());
                break;
            case 'UPDATE_RECENT':
                juliaFractals.sort((a, b) => new Date(b.getUpdatedAt()).getTime() - new Date(a.getUpdatedAt()).getTime());
                break;
            case 'UPDATE_OLD':
                juliaFractals.sort((a, b) => new Date(a.getUpdatedAt()).getTime() - new Date(b.getUpdatedAt()).getTime());
                break;
            default:
                break;
        }
    }
}

export default JuliaFractalService;