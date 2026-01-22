// workers/JuliaFractalMultiWorker.worker.ts
import * as Comlink from "comlink";
import { Scene } from "../model/Scene";
import { JuliaFractal } from "../model/JuliaFractal";
import { GraphicLibrary } from "../libraries/GraphicLibrary";
import { Pixel } from "../model/Pixel";
import { ComplexNb } from "../model/ComplexNb";

const JuliaFractalMultiWorker = {
    async computeJulia(
        width: number, 
        totalHeight: number, // Hauteur TOTALE du canvas (pour les maths)
        sceneJson: any, 
        juliaJson: any,
        gradientStart: number,
        gradientEnd: number,
        backgroundColor: string,
        startY: number,      // Ligne de départ de ce worker
        endY: number         // Ligne de fin (exclue) de ce worker
    ): Promise<Uint8ClampedArray> {
        
        // 1. Reconstruction des objets
        const scene = Scene.fromJSON(sceneJson);
        const juliaFractal = JuliaFractal.fromJSON(juliaJson);

        // 2. Création du buffer PARTIEL (juste la hauteur de la bande)
        const segmentHeight = endY - startY;
        const buffer = new Uint8ClampedArray(width * segmentHeight * 4);

        const pix = new Pixel(0, 0);

        // On boucle seulement sur les lignes concernées par ce worker
        for (let j = startY; j < endY; j++) {
            for (let i = 0; i < width; i++) {

                // --- Logique Mathématique (reste basée sur les coordonnées globales) ---
                pix.setI(i);
                pix.setJ(j);
                
                // Calcul du J mathématique (basé sur la hauteur totale)
                const jCalculated = pix.getJToDraw(totalHeight); 
                pix.setJ(jCalculated);

                const pointM = GraphicLibrary.calcPointFromPix(pix, scene, width, totalHeight);
                const z = new ComplexNb(true, pointM.getX(), pointM.getY());

                const color = juliaFractal.calcColorFromJuliaFractal(
                    z, 
                    gradientStart, 
                    gradientEnd - gradientStart, 
                    backgroundColor
                );

                // --- Remplissage du Buffer ---
                // Le buffer local commence à l'index 0, donc on décale j par startY
                // localJ va de 0 à segmentHeight
                const localJ = j - startY; 
                const index = (localJ * width + i) * 4;

                buffer[index]     = color.getRed();
                buffer[index + 1] = color.getGreen();
                buffer[index + 2] = color.getBlue();
                buffer[index + 3] = color.getAlpha();
            }
        }

        // 3. Transfert
        return Comlink.transfer(buffer, [buffer.buffer]);
    }
};

Comlink.expose(JuliaFractalMultiWorker);
export type JuliaFractalMultiWorkerType = typeof JuliaFractalMultiWorker;
