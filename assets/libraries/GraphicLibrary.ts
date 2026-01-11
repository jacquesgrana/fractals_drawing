import { Pixel } from "../model/Pixel";
import { Point } from "../model/Point";
import { Scene } from "../model/Scene";
import { MatrixLibrary } from "./MatrixLibrary";
import { Color } from "../model/Color";

export class GraphicLibrary {

  /**
   * Calcule une couleur RVB basée sur une valeur, un dégradé arc-en-ciel et des bornes.
   * Le spectre est divisé en 6 segments.
   *
   * @param value Valeur courante (de 0 à limit)
   * @param limit Valeur maximale
   * @param start Décalage du début du spectre (0 à 6)
   * @param range Étendue du spectre utilisée (start + range <= 6)
   */
  static calculateRVB(value: number, limit: number, start: number, range: number): Color {
    let red = 0;
    let green = 0;
    let blue = 0;

    // Sécurité pour éviter la division par zéro
    if (limit === 0) return new Color(0, 0, 0, 255);

    if ((start + range) <= 6) {
      // Position normalisée sur le spectre (0 à 6)
      const x = start + (range * value / limit);

      // Calcul du Rouge
      if (x < 1) {
        red = 255;
      } else if (x < 2) {
        red = Math.round(255 - (x - 1) * 255);
      } else if (x < 4) {
        red = 0;
      } else if (x < 5) {
        red = Math.round((x - 4) * 255);
      } else {
        red = 255;
      }

      // Calcul du Vert
      if (x < 1) {
        green = Math.round(x * 255);
      } else if (x < 3) {
        green = 255;
      } else if (x < 4) {
        green = Math.round(255 - (x - 3) * 255);
      } else {
        green = 0;
      }

      // Calcul du Bleu
      if (x < 2) {
        blue = 0;
      } else if (x < 3) {
        blue = Math.round((x - 2) * 255);
      } else if (x < 5) {
        blue = 255;
      } else {
        blue = Math.round(255 - (x - 5) * 255);
      }
    }

    return new Color(red, green, blue, 255);
  }

  /**
   * Convertit un Pixel (écran) en Point (monde/scène).
   * Applique la mise à l'échelle (step) puis la matrice de transformation de la scène.
   *
   * @param pixel Le pixel à convertir
   * @param scene La scène contenant les paramètres et matrices
   * @param sizeI Largeur fenêtre
   * @param sizeJ Hauteur fenêtre
   */
  public static calcPointFromPix(pixel: Pixel, scene: Scene, sizeI: number, sizeJ: number): Point {
    // 1. Conversion Pixel -> Coordonnées locales (non transformées)
    // On utilise les getters pour respecter l'encapsulation
    const rawX = scene.getMinX() + scene.calcStepX(sizeI) * pixel.getI();
    const rawY = scene.getMinY() + scene.calcStepY(sizeJ) * pixel.getJ();
    
    // Création temporaire du point local
    const localPoint = new Point(rawX, rawY);

    // 2. Application de la transformation (Rotation/Zoom/Translation)
    return GraphicLibrary.transfDir(localPoint, scene);
  }

  /**
   * Convertit un Point (monde) en Pixel (écran).
   * Applique la transformation inverse, puis projette sur la grille de pixels.
   *
   * @param start Le point du monde
   * @param scene La scène
   * @param sizeI Largeur fenêtre
   * @param sizeJ Hauteur fenêtre
   */
  public static calcPixelFromPoint(start: Point, scene: Scene, sizeI: number, sizeJ: number): Pixel {
    // 1. Transformation Inverse (Monde -> Local)
    const localPoint = GraphicLibrary.transfInv(start, scene);
    
    const x = localPoint.getX();
    const y = localPoint.getY();

    // 2. Conversion Local -> Pixel
    // i = (x - min) / pas => ici calculé via proportions
    // sizeI / rangeX est équivalent à 1 / stepX
    const rangeX = scene.getRangeX();
    const rangeY = scene.getRangeY();

    // Sécurité division par zéro
    const i = rangeX !== 0 ? Math.round((x - scene.getMinX()) * sizeI / rangeX) : 0;
    const j = rangeY !== 0 ? Math.round((y - scene.getMinY()) * sizeJ / rangeY) : 0;

    return new Pixel(i, j);
  }

  /**
   * Applique la matrice de transformation directe (Scene -> Monde)
   * Optimisé pour ne pas créer de matrices intermédiaires.
   */
  static transfDir(point: Point, scene: Scene): Point {
    // Utilisation de la méthode optimisée O(1) de MatrixLibrary
    // Évite l'instanciation de 'new Matrix(3,1)' couteuse en mémoire
    return MatrixLibrary.transformPoint(scene.getMatrixDir(), point);
  }

  /**
   * Applique la matrice de transformation inverse (Monde -> Scene)
   * Optimisé pour ne pas créer de matrices intermédiaires.
   */
  static transfInv(point: Point, scene: Scene): Point {
    return MatrixLibrary.transformPoint(scene.getMatrixInv(), point);
  }
}
