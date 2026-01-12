// workers/JuliaFractalWorker.worker.ts
import * as Comlink from "comlink";
import { Scene } from "../model/Scene";
import { JuliaFractal } from "../model/JuliaFractal";
import { GraphicLibrary } from "../libraries/GraphicLibrary";
import { Pixel } from "../model/Pixel";
import { ComplexNb } from "../model/ComplexNb";

const JuliaFractalWorker = {
    async computeJulia(
        width: number, 
        height: number, 
        sceneJson: any, 
        juliaJson: any,
        gradientStart: number,
        gradientEnd: number,
        backgroundColor: string
    ): Promise<Uint8ClampedArray> {
        //console.log('Lancement de la boucle de calcul do worker');
        // 1. Reconstruction des objets (Hydratation)
        const scene = Scene.fromJSON(sceneJson);
        const juliaFractal = JuliaFractal.fromJSON(juliaJson);

        // 2. Création du buffer (4 canaux par pixel : R, G, B, A)
        const buffer = new Uint8ClampedArray(width * height * 4);
        
        // On réutilise les objets pour éviter le Garbage Collection excessif
        const pix = new Pixel(0, 0);

        //console.log('Lancement de la boucle de calcul');

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                
                // Logique tirée de ton Service original :
                // On prépare le Pixel pour le calcul mathématique
                pix.setI(i);
                
                // Note: Vérifie ici si ta méthode getJToDraw a besoin de l'instance ou si elle est statique.
                // Si elle est dans la classe Pixel, c'est bon.
                pix.setJ(j);
                const jCalculated = pix.getJToDraw(height); 
                pix.setJ(jCalculated);

                // Calcul mathématique
                const pointM = GraphicLibrary.calcPointFromPix(pix, scene, width, height);
                const z = new ComplexNb(true, pointM.getX(), pointM.getY());

                const color = juliaFractal.calcColorFromJuliaFractal(
                    z, 
                    gradientStart, 
                    gradientEnd - gradientStart, 
                    backgroundColor
                );

                // Index dans le tableau linéaire (ImageData se remplit ligne par ligne)
                // Attention: ImageData attend (colonne i, ligne j).
                // Si ta boucle externe est 'i' (colonnes), le calcul d'index est :
                const index = (j * width + i) * 4;

                buffer[index]     = color.getRed();
                buffer[index + 1] = color.getGreen();
                buffer[index + 2] = color.getBlue();
                buffer[index + 3] = color.getAlpha();
            }
        }

        // 3. Transfert de propriété du buffer (Zero-copy) pour la performance
        return Comlink.transfer(buffer, [buffer.buffer]);
    }
};

Comlink.expose(JuliaFractalWorker);

// Export du type pour l'autocomplétion côté Service
export type JuliaFractalWorkerType = typeof JuliaFractalWorker;
