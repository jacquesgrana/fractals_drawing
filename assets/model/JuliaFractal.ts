import { GraphicLibrary } from "../libraries/GraphicLibrary";
import { Color } from "./Color";
import { ComplexNb } from "./ComplexNb";

/*
 * Classe représentant les paramètres de calcul de la fractale de Julia
 */
export class JuliaFractal {
  private id: number;
  private name: string;
  private comment: string;
  private seed: ComplexNb; // seed (c) de la fractale
  private limit: number;   // limite du module (seuil d'échappement)
  private maxIt: number;   // maximum d'itérations
  private isPublic: boolean;
  private createdAt: string;
  private updatedAt: string;

  // Optimisation : on stocke la limite au carré pour éviter les sqrt() dans la boucle
  private limitSq: number; 

  /*
   * Constructeur
   */
  constructor(id: number, name: string, comment: string, seed: ComplexNb, limit: number, maxIt: number, isPublic: boolean, createdAt: string, updatedAt: string) {
    this.id = id;
    this.name = name;
    this.comment = comment;
    this.seed = seed;
    this.limit = limit;
    this.limitSq = limit * limit; // Pré-calcul
    this.maxIt = maxIt;
    this.isPublic = isPublic;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // ==========================
  // Accesseurs
  // ==========================

  getId(): number { return this.id; }
  getName(): string { return this.name; }
  getComment(): string { return this.comment; }
  getSeed(): ComplexNb { return this.seed; }
  getLimit(): number { return this.limit; }
  getMaxIt(): number { return this.maxIt; }
  getIsPublic(): boolean { return this.isPublic; }
  getCreatedAt(): string { return this.createdAt; }
  getUpdatedAt(): string { return this.updatedAt; }
  
  // ==========================
  // Mutateurs
  // ==========================

  setId(id: number): void { this.id = id; }
  setName(name: string): void { this.name = name; }
  setComment(comment: string): void { this.comment = comment; }
  setSeed(seed: ComplexNb): void { this.seed = seed; }
  setLimit(limit: number): void { 
    this.limit = limit;
    this.limitSq = limit * limit; // Mise à jour impérative de l'optimisation
  }
  setMaxIt(maxIt: number): void { this.maxIt = maxIt; }
  setIsPublic(isPublic: boolean): void { this.isPublic = isPublic; }
  setCreatedAt(createdAt: string): void { this.createdAt = createdAt; }
  setUpdatedAt(updatedAt: string): void { this.updatedAt = updatedAt; }

  /**
   * Calcule la couleur d'un point z donné selon les paramètres de la fractale.
   *
   * @param z Nombre complexe représentant le point du plan à tester
   * @param gradientStart Décalage du dégradé (0-6)
   * @param gradientRange Étendue du dégradé
   * @param bgColor Objet Color pour le fond (ou string selon votre implémentation de Color)
   */
  calcColorFromJuliaFractal(z: ComplexNb, gradientStart: number, gradientRange: number, bgColor: string): Color {
    
    // 1. Initialisation des variables locales (plus rapide que les getters répétés)
    let cx = this.seed.getReal();
    let cy = this.seed.getImag();
    
    let xz = z.getReal();
    let yz = z.getImag();
    
    // Calcul du module carré initial (x² + y²)
    let modSq = xz * xz + yz * yz;
    
    let iteration = this.maxIt;
    const limitSq = this.limitSq; // Utilisation de la limite au carré

    // 2. Boucle de calcul optimisée
    // On compare modSq < limitSq pour éviter Math.sqrt() à chaque tour
    while ((modSq < limitSq) && (iteration > 0)) {
        // Formule de Julia : z = z² + c
        // (x + iy)² + c = (x² - y² + cx) + i(2xy + cy)
        
        let subX = xz * xz - yz * yz; // partie réelle temporaire
        yz = 2 * xz * yz + cy;        // nouvelle partie imaginaire
        xz = subX + cx;               // nouvelle partie réelle (on utilise tmpX)
        
        modSq = xz * xz + yz * yz;    // Mise à jour du module carré
        iteration--;
    }

    // 3. Détermination de la couleur
    if (iteration > 0) {
       // Le point a "échappé" à la limite avant la fin des itérations
       // Note : Si bgColor est une string hex, assurez-vous que Color a une méthode statique pour ça.
       // Sinon, retournez une couleur par défaut.
       return Color.createFromRgba ? Color.createFromRgba(bgColor) : new Color(0,0,0,255); 
    } else {
       // Le point est resté "prisonnier" (dans l'ensemble) jusqu'à la fin
       // On calcule la vraie racine carrée uniquement ici, une seule fois.
       let finalModule = Math.sqrt(modSq);
       return GraphicLibrary.calculateRVB(finalModule, this.limit, gradientStart, gradientRange);
    }
  }

  clone(): JuliaFractal {
    // Note : seed.clone() est important pour éviter les références partagées
    return new JuliaFractal(
        this.id, // attention !!!!!!
        this.name, 
        this.comment,
        this.seed.clone(), 
        this.limit, 
        this.maxIt,
        this.isPublic,
        this.createdAt,
        this.updatedAt
    );
  }

  toString(): string {
    return `id : ${this.id} name : ${this.name} seed : ( ${this.seed.toString()} ) limit : ${this.limit} maxIt : ${this.maxIt}`;
  }

  toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      comment: this.comment,
      seed: this.seed.toJSON(),
      limit: this.limit,
      maxIt: this.maxIt
    };
  }

  static fromJSON(json: {
    id: number;
    name: string;
    comment: string;
    seed: {
      isCart: boolean;
      real: number;
      imag: number;
      mod: number;
      arg: number;
    };
    limit: number;
    maxIt: number;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
  }): JuliaFractal {
    return new JuliaFractal(
      json.id,
      json.name,
      json.comment,
      ComplexNb.fromJSON(json.seed),
      json.limit,
      json.maxIt,
      json.isPublic,
      json.createdAt,
      json.updatedAt
    );
  }
}
