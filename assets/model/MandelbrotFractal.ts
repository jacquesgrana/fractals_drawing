import { GraphicLibrary } from "../libraries/GraphicLibrary";
import { Color } from "./Color";
import { ComplexNb } from "./ComplexNb";

export class MandelbrotFractal {
  private id: number;
  private name: string;
  // Pas de seed pour Mandelbrot car C dépend du pixel.
  private limit: number;
  private limitSq: number;
  private maxIt: number;

  constructor(id: number, name: string, limit: number, maxIt: number) {
    this.id = id;
    this.name = name;
    this.limit = limit;
    this.limitSq = limit * limit; // Optimisation
    this.maxIt = maxIt;
  }

  // Getters / Setters classiques...
  getId(): number { return this.id; }
  getLimit(): number { return this.limit; }
  
  /**
    * Algorithme spécifique à Mandelbrot
    * z (paramètre) devient c (la constante)
    * z (variable itérée) commence à 0
    */
  calcColorFromMandelbrot(pixelCoord: ComplexNb, gradientStart: number, gradientRange: number, bgColor: string): Color {
     // 1. Initialisation différente de Julia
     // Pour Mandelbrot, 'c' est le point du plan complexe (le pixel)
     let cx = pixelCoord.getReal();
     let cy = pixelCoord.getImag();

     // Et z commence toujours à 0
     let xz = 0;
     let yz = 0;

     let iteration = this.maxIt;
     let modSq = 0;
     
     // 2. Boucle de calcul (z = z² + c)
     while ((modSq < this.limitSq) && (iteration > 0)) {
       let tempX = xz * xz - yz * yz + cx; // + cx ici (qui varie selon le pixel)
       yz = 2 * xz * yz + cy;              // + cy ici
       xz = tempX;
       
       modSq = xz * xz + yz * yz;
       iteration--;
     }

     // 3. Couleur
     if (iteration > 0) {
       // Supposant que Color gère le string ou via une méthode static
       return new Color(0, 0, 0, 255); 
     } else {
       // Lissage optionnel ou brut
       return GraphicLibrary.calculateRVB(Math.sqrt(modSq), this.limit, gradientStart, gradientRange);
     }
  }
}
