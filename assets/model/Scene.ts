import { MathLibrary } from "../libraries/MathLibrary";
import { MatrixLibrary } from "../libraries/MatrixLibrary";
import { Matrix } from "./Matrix";
import { Point } from "./Point";

/*
 * Classe représentant les paramètres d'une scene
 */
export class Scene {
  private minX: number;
  private minY: number;
  private rangeX: number;
  private rangeY: number;
  private trans: Point;
  private angle: number; // angle en degrés
  private zoom: number;
  
  // Ces matrices sont calculées, on ne doit pas pouvoir les "setter" de l'extérieur directement
  private matrixDir: Matrix;
  private matrixInv: Matrix;

  /*
   * Constructeur
   */
  constructor(minX: number, minY: number, rangeX: number, rangeY: number, trans: Point, angle: number, zoom: number) {
    this.minX = minX;
    this.minY = minY;
    this.rangeX = rangeX;
    this.rangeY = rangeY;
    this.trans = trans;
    this.angle = angle;
    this.zoom = zoom;
    
    // Initialisation
    this.matrixDir = new Matrix(3, 3);
    this.matrixInv = new Matrix(3, 3);
    
    // Premier calcul obligatoire
    this.updateMatrix();
  }

  // ==========================
  // Getters standard
  // ==========================

  getMinX(): number { return this.minX; }
  getMinY(): number { return this.minY; }
  getRangeX(): number { return this.rangeX; }
  getRangeY(): number { return this.rangeY; }
  
  getTrans(): Point { return this.trans; }
  getAngle(): number { return this.angle; }
  getZoom(): number { return this.zoom; }
  
  getMatrixDir(): Matrix { return this.matrixDir; }
  getMatrixInv(): Matrix { return this.matrixInv; }

  // ==========================
  // Setters
  // ==========================

  setMinX(minX: number): void { this.minX = minX; }
  setMinY(minY: number): void { this.minY = minY; }
  setRangeX(rangeX: number): void { this.rangeX = rangeX; }
  setRangeY(rangeY: number): void { this.rangeY = rangeY; }

  /**
   * Modifie la translation et recalcule immédiatement les matrices
   */
  setTrans(trans: Point): void {
    this.trans = trans;
    this.updateMatrix();
  }

  /**
   * Modifie l'angle et recalcule immédiatement les matrices
   */
  setAngle(angle: number): void {
    this.angle = angle;
    this.updateMatrix();
  }

  /**
   * Modifie le zoom et recalcule immédiatement les matrices
   */
  setZoom(zoom: number): void {
    this.zoom = zoom;
    this.updateMatrix();
  }

  // ==========================
  // Logique Métier
  // ==========================

  /**
   * Méthode privée recalculant la matrice de transformation et son inverse
   * basée sur l'angle, le zoom et la translation actuels.
   */
  private updateMatrix(): void {
    const rad = MathLibrary.degreeToRad(this.angle);
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const z = this.zoom;
    
    // Création de la matrice de transformation affine
    // [ z*cos  -z*sin  tx ]
    // [ z*sin   z*cos  ty ]
    // [   0       0     1 ]
    
    let matrixDir = new Matrix(3, 3);
    
    // On peut utiliser setValueAt si Matrix n'expose pas getValues()
    // Ou l'accès direct optimisé si tu as modifié Matrix
    matrixDir.setValueAt(0, 0, z * c);
    matrixDir.setValueAt(0, 1, -z * s);
    matrixDir.setValueAt(0, 2, this.trans.getX());

    matrixDir.setValueAt(1, 0, z * s);
    matrixDir.setValueAt(1, 1, z * c);
    matrixDir.setValueAt(1, 2, this.trans.getY());

    matrixDir.setValueAt(2, 0, 0);
    matrixDir.setValueAt(2, 1, 0);
    matrixDir.setValueAt(2, 2, 1);

    this.matrixDir = matrixDir;
    
    // Calcul de l'inverse
    try {
        this.matrixInv = MatrixLibrary.inverse(matrixDir);
    } catch (e) {
        // Au cas où le déterminant serait nul (ex: zoom = 0)
        console.error("Erreur inversion matrice", e);
    }
  }

  toString(): string {
    return `minX : ${this.minX} minY : ${this.minY} rangeX : ${this.rangeX} rangeY : ${this.rangeY} trans ( ${this.trans.toString()} ) angle : ${this.angle} zoom : ${this.zoom}`;
  }

  calcStepX(sizeX: number): number {
    if (sizeX === 0) return 0;
    return (this.rangeX / sizeX);
  }

  calcStepY(sizeY: number): number {
    if (sizeY === 0) return 0;
    return (this.rangeY / sizeY);
  }

  calcMiddle(): Point {
    let midX = this.minX + this.rangeX / 2;
    let midY = this.minY + this.rangeY / 2;
    return new Point(midX, midY);
  }
}
