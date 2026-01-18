import UrlConfig from "../config/UrlConfig";
import { ComplexNb } from "../model/ComplexNb";
import { JuliaFractal } from "../model/JuliaFractal";
import { Nullable } from "../types/indexType";


class JuliaFractalService {

    private publicJuliaFractals: JuliaFractal[] = [];
    private userJuliaFractals: JuliaFractal[] = [];

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
                        juliaFractalFromDb.updatedAt
                    );
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

        const response2 = await this.getUserFractals();
        if (response2) {
            this.userJuliaFractals = [];
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
                        juliaFractalFromDb.updatedAt
                    );
                    this.userJuliaFractals?.push(juliaFractal);
                })
            } 
            catch (err) {
                console.error(err);
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
}

export default JuliaFractalService;