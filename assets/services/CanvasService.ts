import { GraphicLibrary } from "../libraries/GraphicLibrary";
import { MathLibrary } from "../libraries/MathLibrary";
import { Color } from "../model/Color";
import { ComplexNb } from "../model/ComplexNb";
import { JuliaFractal } from "../model/JuliaFractal";
import { MandelbrotFractal } from "../model/MandelbrotFractal";
import { Pixel } from "../model/Pixel";
import { Point } from "../model/Point";
import { Scene } from "../model/Scene";

const COLOR_FILL_SELECT: string = 'rgba(235, 125, 52, 0.38)';
const COLOR_STROKE_SELECT: string = 'rgba(235, 125, 52, 0.0)';
const COLOR_STROKE_ANGLE_INDICATOR: string = 'rgba(255,255,255,0.38)';
const COLOR_FILL_ANGLE_INDICATOR_DOT: string = 'rgba(245, 34, 45, 1.0)';
const COLOR_FILL_ANGLE_INDICATOR: string = 'rgba(252, 141, 30, 0.62)';
const COLOR_BACKGROUND: string = 'rgba(0,0,0,1.0)';
const COLOR_STROKE_AXES: string = 'rgba(255,255,255,0.38)';
const COLOR_FILL_AXES: string = 'rgba(255,255,255,0.62)';

const DEFAULT_ZOOM_PERCENT_VALUE: number = 11.76;
const STEP_ZOOM_PERCENT_VALUE: number = 5.96;

const DEFAULT_GRADIENT_START: number = 3;
const DEFAULT_GRADIANT_END: number = 5;

/**
 * Classe du service qui gère le canvas
 */
class CanvasService {
    private static instance: CanvasService;

    private juliaFractal!: JuliaFractal;

    private mandelbrotFractal! : MandelbrotFractal;

    private imageData!: ImageData;
    private tabToDraw!: Color[][];

    private canvasWidth!: number;
    private canvasHeight!: number;

    // ElementRef dans Angular
    private canvas!: HTMLCanvasElement; // !!!!!!!

    private context!: CanvasRenderingContext2D;

    /*
    private real: number = 0;
    private imag: number = 0;
    private limit: number = 2;
    private iterNb: number = 100;
    */

    public currentScene!: Scene;
    public trans: Point = new Point(0, 0);;
    public angle!: number;
    public zoom!: number;

    public gradientStart: number = DEFAULT_GRADIENT_START;
    public gradientEnd: number = DEFAULT_GRADIANT_END;

    public static getInstance(): CanvasService {
        if (!CanvasService.instance) {
            CanvasService.instance = new CanvasService();
        }
        return CanvasService.instance;
    }

    private constructor() {
        this.juliaFractal = new JuliaFractal(0, "Classique", new ComplexNb(true, -0.4, -0.59), 2, 150);
        this.mandelbrotFractal = new MandelbrotFractal(1, "Mandelbrot", 2, 300);

        //this.real = this.juliaFractal.getSeed().getReal();
        //this.imag = this.juliaFractal.getSeed().getImag();
        //this.limit = this.juliaFractal.getLimit();
        //this.iterNb = this.juliaFractal.getMaxIt();
    }

  /**
   * Méthode d'initialisation des données du service
   */
    public initService(): void {
        this.initTabToDraw();
        this.angle = 0;
        this.zoom = 1.5;
        //this.trans = new Point(-1.33, 0);
        this.trans = new Point(0, 0);

        const deltaY = 2;
        const minY = -1;
        const deltaX = deltaY * this.canvasWidth / this.canvasHeight;
        const minX = -1 * deltaX / 2;
        this.currentScene = new Scene(minX, minY, deltaX, deltaY, this.trans, this.angle, this.zoom);
        //this.initImageData();
    }

    /**
     * Méthode d'initialisation du tableau qui sera affiché dans le canvas
     */
    public initTabToDraw(): void {
        this.tabToDraw = new Array(this.canvasWidth);
        for (let i = 0; i < this.canvasWidth; i++) {
            this.tabToDraw[i] = new Array(this.canvasHeight);
            for (let j = 0; j < this.canvasHeight; j++) {
                this.tabToDraw[i][j] = Color.createFromRgba(COLOR_BACKGROUND);
            }
        }
    }

    /**
     * Méthode d'initialisation de l'imageData du canvas
     */
    public initImageData(): void {
        this.imageData = this.context.createImageData(this.canvasWidth, this.canvasHeight);
        //this.data = this.imageData.data;
    }

    /**
     * Méthode qui copie les couleurs du tableau vers l'imageData.data du canvas
     */
    public loadImageFromTab(): void {
        for (let i = 0; i < this.canvasWidth; i++) {
            for (let j = 0; j < this.canvasHeight; j++) {
                let indice: number = (j * this.canvasWidth * 4) + (i * 4);
                this.imageData.data[indice] = this.tabToDraw[i][j].getRed();
                this.imageData.data[indice + 1] = this.tabToDraw[i][j].getGreen();
                this.imageData.data[indice + 2] = this.tabToDraw[i][j].getBlue();
                this.imageData.data[indice + 3] = this.tabToDraw[i][j].getAlpha();
            }
        }
        //this.imageData.data = this.data;
    }

    /**
   * Méthode qui calcule et renvoie le tableau des couleurs calculées selon la fractale
   * @returns promise tableau contenant les couleurs calculées des pixels du canvas
   */
  public async updateTabToDraw(): Promise<Color[][]> {
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

        /*
        setTimeout(() => {
            this.calcFractalProgressObs$.next(0);
        }, 400);
        */
        resolve(tabToDraw);
    });

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
}

export default CanvasService;