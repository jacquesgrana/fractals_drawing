import UrlConfig from "../config/UrlConfig";
import { ComplexNb } from "../model/ComplexNb";
import { JuliaFractal } from "../model/JuliaFractal";
import { Nullable } from "../types/indexType";


class JuliaFractalService {

    private publicJuliaFractals: JuliaFractal[] = [];

    private static instance: JuliaFractalService;
    public static getInstance(): JuliaFractalService {
        if (!JuliaFractalService.instance) {
            JuliaFractalService.instance = new JuliaFractalService();
        }
        return JuliaFractalService.instance;
    }

    private constructor() {
        this.publicJuliaFractals = new Array<JuliaFractal>();
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

        //console.log(this.publicJuliaFractals);
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

    setPublicJuliaFractals(juliaFractals: JuliaFractal[]): void {
        this.publicJuliaFractals = juliaFractals;
    }

    getPublicJuliaFractals(): JuliaFractal[] {
        return this.publicJuliaFractals;
    }
}

export default JuliaFractalService;