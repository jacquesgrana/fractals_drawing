import { GraphicLibrary } from "../libraries/GraphicLibrary";
//import { MathLibrary } from "../libraries/MathLibrary";
import { Color } from "../model/Color";
import { ComplexNb } from "../model/ComplexNb";
import { JuliaFractal } from "../model/JuliaFractal";
import { MandelbrotFractal } from "../model/MandelbrotFractal";
import { Pixel } from "../model/Pixel";
import { Point } from "../model/Point";
import { Scene } from "../model/Scene";
import { Nullable } from "../types/indexType";
import * as Comlink from "comlink";
import { JuliaFractalWorkerType } from "../workers/JuliaFractalWorker.worker";
import { JuliaFractalMultiWorkerType } from "../workers/JuliaFractalMultiWorker.worker";

const COLOR_FILL_SELECT: string = 'rgba(235, 125, 52, 0.38)';
const COLOR_STROKE_SELECT: string = 'rgba(235, 125, 52, 0.8)';
//const COLOR_STROKE_ANGLE_INDICATOR: string = 'rgba(255,255,255,0.38)';
//const COLOR_FILL_ANGLE_INDICATOR_DOT: string = 'rgba(245, 34, 45, 1.0)';
//const COLOR_FILL_ANGLE_INDICATOR: string = 'rgba(252, 141, 30, 0.62)';
const COLOR_BACKGROUND: string = 'rgba(0,0,0,1.0)';
//const COLOR_STROKE_AXES: string = 'rgba(255,255,255,0.38)';
//const COLOR_FILL_AXES: string = 'rgba(255,255,255,0.62)';

const DEFAULT_ZOOM_PERCENT_VALUE: number = 11.76;
const STEP_ZOOM_PERCENT_VALUE: number = 5.96;

const DEFAULT_GRADIENT_START: number = 0;
const DEFAULT_GRADIANT_END: number = 6;

const NB_THREADS = 8;

/**
 * Classe du service qui gère le canvas
 */
class CanvasService {
    private static instance: CanvasService;

    //private worker: Nullable<Worker> = null;
    private workerApi: Comlink.Remote<JuliaFractalWorkerType> | null = null;
    private workersApi: Comlink.Remote<JuliaFractalMultiWorkerType>[] = [];
    private juliaFractal!: JuliaFractal;

    //private mandelbrotFractal! : MandelbrotFractal;

    //private imageData!: ImageData;
    //private tabToDraw!: Color[][];

    private canvasWidth!: number;
    private canvasHeight!: number;

    // ElementRef dans Angular
    private canvas!: HTMLCanvasElement; // !!!!!!!

    private context!: CanvasRenderingContext2D;

    private buffer!: ImageData;

    // TODO : passer en private avec getters et setters

    public currentScene!: Scene;
    public trans: Point = new Point(0, 0);;
    public angle!: number;
    public zoom!: number;

    public canvasCalculationTime: number = 0;

    public gradientStart: number = DEFAULT_GRADIENT_START;
    public gradientEnd: number = DEFAULT_GRADIANT_END;

    public static getInstance(): CanvasService {
        if (!CanvasService.instance) {
            CanvasService.instance = new CanvasService();
        }
        return CanvasService.instance;
    }

    private constructor() {

        this.initWorkers();

        const worker = new Worker(
            new URL('../workers/JuliaFractalWorker.worker.ts', import.meta.url), 
            { type: 'module' } // Important pour pouvoir faire des imports dans le worker
        );
        
        this.workerApi = Comlink.wrap<JuliaFractalWorkerType>(worker);

        this.juliaFractal = new JuliaFractal(0, "Classique", "", new ComplexNb(true, -0.4, -0.59), 2, 150, true, "2026-01-13T15:53:59+00:00", "2026-01-13T15:55:01+00:00");
        //this.mandelbrotFractal = new MandelbrotFractal(1, "Mandelbrot", 2, 300);
    }

    /**
     * Initialise le pool de workers
     */
    private initWorkers() {
        for (let i = 0; i < NB_THREADS; i++) {
            const worker = new Worker(
                new URL('../workers/JuliaFractalMultiWorker.worker.ts', import.meta.url), 
                { type: 'module' }
            );
            this.workersApi.push(Comlink.wrap<JuliaFractalMultiWorkerType>(worker));
        }
    }

    /**
     * Méthode d'initialisation des données du service
     */
    public initService(): void {
        //this.initTabToDraw();
        this.angle = 0;
        this.zoom = 1.5;
        //this.trans = new Point(-1.33, 0);
        this.trans = new Point(0, 0);

        const deltaY = 2;
        const minY = -1;
        const deltaX = deltaY * this.canvasWidth / this.canvasHeight;
        const minX = -1 * deltaX / 2;
        this.currentScene = new Scene(minX, minY, deltaX, deltaY, this.trans, this.angle, this.zoom);

        //this.buffer = this.context.createImageData(this.canvasWidth, this.canvasHeight);
        this.initImageData();
    } 

    /**
     * Méthode d'initialisation du tableau qui sera affiché dans le canvas
     */
    /*
    public initTabToDraw(): void {
        this.tabToDraw = new Array(this.canvasWidth);
        for (let i = 0; i < this.canvasWidth; i++) {
            this.tabToDraw[i] = new Array(this.canvasHeight);
            for (let j = 0; j < this.canvasHeight; j++) {
                this.tabToDraw[i][j] = Color.createFromRgba(COLOR_BACKGROUND);
            }
        }
    }*/

    /**
     * Méthode d'initialisation de l'imageData du canvas
     */
    public initImageData(): void {
        this.buffer = this.context.createImageData(this.canvasWidth, this.canvasHeight);
        //this.data = this.imageData.data;
    }

    
    /**
     * Méthode qui copie les couleurs du tableau vers l'imageData.data du canvas
     */
    /*
    public loadImageFromTab(): void {
        for (let i = 0; i < this.canvasWidth; i++) {
            for (let j = 0; j < this.canvasHeight; j++) {
                let indice: number = (j * this.canvasWidth * 4) + (i * 4);
                this.buffer.data[indice] = this.tabToDraw[i][j].getRed();
                this.buffer.data[indice + 1] = this.tabToDraw[i][j].getGreen();
                this.buffer.data[indice + 2] = this.tabToDraw[i][j].getBlue();
                this.buffer.data[indice + 3] = this.tabToDraw[i][j].getAlpha();
            }
        }
        //this.imageData.data = this.data;
    }*/

  /**
   * Méthode qui calcule et renvoie le tableau des couleurs calculées selon la fractale
   * @returns promise tableau contenant les couleurs calculées des pixels du canvas
   */
  /*
  public async getTabToDraw(): Promise<Color[][]> {
    //this.cd.detectChanges();
    return new Promise<Color[][]>((resolve) => {
        //let startTime: Date = new Date(Date.now());
        //let endTime: Date;
        let tabToDraw: Color[][] = new Array(this.canvasHeight);

        const max = (this.canvasWidth * this.canvasHeight) - 1;
        let cpt = 0;
        let pix = new Pixel(0, 0);
        //let tabToDraw: Color[][] = new Array(this.canvasWidth);
        for (let i = 0; i < this.canvasWidth; i++) {
            tabToDraw[i] = new Array(this.canvasHeight);
            for (let j = 0; j < this.canvasHeight; j++) {

            pix.setI(i);
            pix.setJ(j);
            let pointM = GraphicLibrary.calcPointFromPix(pix, this.currentScene, this.canvasWidth, this.canvasHeight);
            let z = new ComplexNb(true, pointM.getX(), pointM.getY());
            let colorPt = this.juliaFractal.calcColorFromJuliaFractal(z, this.gradientStart, this.gradientEnd - this.gradientStart, COLOR_BACKGROUND);
            //let colorPt = this.mandelbrotFractal.calcColorFromMandelbrot(z, this.gradientStart, this.gradientEnd - this.gradientStart, COLOR_BACKGROUND);
            tabToDraw[pix.getI()][pix.getJToDraw(this.canvasHeight)] = colorPt;

            //let jobPercent = Math.round(100 * cpt / max);
            //if (jobPercent % 25 === 0) {

            //}
            cpt++;
            }
        }

        //this.calcFractalProgressObs$.next(100);
        //endTime = new Date(Date.now());
        //this.calcTimeObs$.next(endTime.getTime() - startTime.getTime());


        resolve(tabToDraw);
    });

  }
*/

  /**
     * Calcule la fractale et remplit directement le buffer (sans Color[][])
     */
    /*
    public async computeFractalToBuffer(): Promise<void> {
        return new Promise((resolve) => {
            const pix = new Pixel(0, 0);
            const data = this.buffer.data; // Accès direct au Uint8ClampedArray

            for (let i = 0; i < this.canvasWidth; i++) {
                for (let j = 0; j < this.canvasHeight; j++) {
                    //const jj = this.canvasHeight - j - 1;
                    pix.setI(i);
                    
                    pix.setJ(j);
                    pix.setJ(pix.getJToDraw(this.canvasHeight));
                    const pointM = GraphicLibrary.calcPointFromPix(
                        pix,
                        this.currentScene,
                        this.canvasWidth,
                        this.canvasHeight
                    );
                    const z = new ComplexNb(true, pointM.getX(), pointM.getY());

                    // Récupère la couleur sous forme d'objet Color (à adapter)
                    const color = this.juliaFractal.calcColorFromJuliaFractal(
                        z,
                        this.gradientStart,
                        this.gradientEnd - this.gradientStart,
                        COLOR_BACKGROUND
                    );

                    // Calcule l'index dans le buffer
                    const idx = (j * this.canvasWidth + i) * 4;
                    data[idx] = color.getRed();     // R
                    data[idx + 1] = color.getGreen(); // G
                    data[idx + 2] = color.getBlue();  // B
                    data[idx + 3] = color.getAlpha(); // Alpha
                }
            }
            resolve();
        });
    }
        */

    /**
     * Appelle les workers pour calculer la fractale en parallèle
     */
    public async computeFractalWithWorkers(): Promise<void> {
        if (this.workersApi.length === 0) {
            console.error("Workers non initialisés");
            return;
        }

        try {
            this.canvasCalculationTime = 0;
            const startTime = performance.now();

            // 1. Découpage du travail
            const segmentHeight = Math.floor(this.canvasHeight / NB_THREADS);
            
            // Préparation des promesses
            const promises: Promise<Uint8ClampedArray>[] = [];

            // Sérialisation unique pour éviter de le refaire 4 fois
            const sceneJson = this.currentScene.toJSON();
            const juliaJson = this.juliaFractal.toJSON();

            for (let k = 0; k < NB_THREADS; k++) {
                const startY = k * segmentHeight;
                // Le dernier worker prend le reste (si hauteur pas divisible par 4)
                const endY = (k === NB_THREADS - 1) ? this.canvasHeight : startY + segmentHeight;

                // On lance le calcul sur le worker k
                promises.push(
                    this.workersApi[k].computeJulia(
                        this.canvasWidth,
                        this.canvasHeight, // Hauteur Totale
                        sceneJson,
                        juliaJson,
                        this.gradientStart,
                        this.gradientEnd,
                        COLOR_BACKGROUND,
                        startY, // Début bande
                        endY    // Fin bande
                    )
                );
            }

            // 2. Attente de tous les workers (Parallélisme réel ici)
            const segments = await Promise.all(promises);

            // 3. Reconstitution de l'image finale
            // La méthode .set() est extrêmement rapide
            let offset = 0;
            for (const segment of segments) {
                this.buffer.data.set(segment, offset);
                offset += segment.length;
            }

            const endTime = performance.now();
            this.canvasCalculationTime = endTime - startTime;
            
        } catch (error) {
            console.error("Erreur lors du calcul multi-thread:", error);
        }
    }

    public async computeBufferWithWorker(juliaFractalToDraw: JuliaFractal, canvasWidth: number, canvasHeight: number): Promise<ImageData> {
        const sceneToDraw = new Scene(
            -1.5, 
            -1.5, 
            3.0, 
            3.0,
            new Point(0, 0), 
            0, 
            1.0
        );

        if (!this.workerApi) {
            console.error("Worker non initialisé");
            return new ImageData(0, 0);
        }
        const rawPixels: Uint8ClampedArray = await this.workerApi.computeJulia(
            canvasWidth, 
            canvasHeight, 
            sceneToDraw.toJSON(), 
            juliaFractalToDraw.toJSON(),
            1,
            5,
            COLOR_BACKGROUND
        );
        const buffer: ImageData = this.context.createImageData(canvasWidth, canvasHeight);
        buffer.data.set(rawPixels);
        return buffer;
    }

    /**
     * Appelle le worker pour calculer la fractale
     */
    public async computeFractalWithWorker(): Promise<void> {
        if (!this.workerApi) {
            console.error("Worker non initialisé");
            return;
        }

        try {
            this.canvasCalculationTime = 0;
            const startTime = performance.now();
            // Appel asynchrone au worker
            // On passe les versions .toJSON() des objets complexes
            const rawPixels: Uint8ClampedArray = await this.workerApi.computeJulia(
                this.canvasWidth,
                this.canvasHeight,
                this.currentScene.toJSON(),   // Sérialisation
                this.juliaFractal.toJSON(),   // Sérialisation
                this.gradientStart,
                this.gradientEnd,
                COLOR_BACKGROUND
            );

            // Mise à jour du buffer local avec les données reçues
            // rawPixels est un Uint8ClampedArray, imageData.data en est un aussi.
            // La méthode .set() est très rapide.
            this.buffer.data.set(rawPixels);

            // Arrêt du chronomètre
            const endTime = performance.now();
        
            // Calcul du temps écoulé en millisecondes
            this.canvasCalculationTime = endTime - startTime;
            //console.log(`Calcul terminé en ${this.canvasCalculationTime.toFixed(2)} ms`);
        } catch (error) {
            console.error("Erreur lors du calcul dans le worker:", error);
        }
    }

    /**
     * Dessine un rectangle de sélection semi-transparent sur le canvas
     * @param startPixel - Pixel de départ du drag
     * @param endPixel - Pixel de fin du drag
     */
    public drawSelectionRectangle(startPixel: Pixel, endPixel: Pixel): void {
        if (!startPixel || !endPixel) return;

        // Sauvegarde l'état actuel du canvas
        this.context.save();

        // Calcul des coordonnées du rectangle
        const i = Math.min(startPixel.getI(), endPixel.getI());
        const j = Math.min(startPixel.getJ(), endPixel.getJ());
        const width = Math.abs(endPixel.getI() - startPixel.getI());
        const height = Math.abs(endPixel.getJ() - startPixel.getJ());

        // Style du rectangle
        this.context.fillStyle = COLOR_FILL_SELECT; // 'rgba(235, 125, 52, 0.38)'
        this.context.strokeStyle = COLOR_STROKE_SELECT; // Bordure plus visible
        this.context.lineWidth = 2;

        // Dessin du rectangle
        this.context.fillRect(i, j, width, height);
        this.context.strokeRect(i, j, width, height);

        // Restaure l'état précédent
        this.context.restore();
    }

    /**
     * Dessine le buffer dans le canvas
     */
    public drawBufferToCanvas(): void {
        this.context.putImageData(this.buffer, 0, 0);
    }

    /**
     * Efface le canvas
     */
    public clearCanvas(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


  setCanvasWidth(width: number): void {
    this.canvasWidth = width;
  }

  setCanvasHeight(height: number): void {
    this.canvasHeight = height;
  }

  setCanvasContext(context: CanvasRenderingContext2D): void {
    this.context = context;
  }

  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  setBuffer(buffer: ImageData): void {
    this.buffer = buffer;
  }

  setJuliaFractal(juliaFractal: JuliaFractal): void {
    this.juliaFractal = juliaFractal;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getCanvasContext(): CanvasRenderingContext2D {
    return this.context;
  }

  getBuffer(): ImageData {
    return this.buffer;
  }

  getJuliaFractal(): JuliaFractal {
    return this.juliaFractal;
  }
}

export default CanvasService;