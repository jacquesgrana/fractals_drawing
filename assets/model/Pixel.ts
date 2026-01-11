/*
 * Classe représentant un pixel d'une fenêtre de hauteur SIZE_J 
 * (height de la méthode getJToDraw)
 */
export class Pixel {
  private i: number; // coordonnée horizontale (colonne)
  private j: number; // coordonnée verticale (ligne)

  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
  }

  // --- Getters / Setters (Style POO) ---

  setI(i: number): void {
    this.i = i;
  }

  setJ(j: number): void {
    this.j = j;
  }

  getI(): number {
    return this.i;
  }

  getJ(): number {
    return this.j;
  }

  // --- Méthodes Métier ---

  /*
   * Renvoie la coordonnée verticale inversée pour l'affichage
   * Utile pour convertir un repère cartésien (0 en bas) vers un repère écran (0 en haut)
   */
  getJToDraw(height: number): number {
    // Le -1 est important car les indices vont de 0 à height-1
    return height - this.j - 1;
  }

  toString(): string {
    return `i : ${this.i} / j : ${this.j}`;
  }

  calcDist(endPixel: Pixel): number {
    // Utilisation de Math.hypot et accès direct aux propriétés pour la performance
    return Math.hypot(endPixel.i - this.i, endPixel.j - this.j);
  }

  equals(toCompare: Pixel): boolean {
    // Comparaison directe plus rapide
    return this.i === toCompare.i && this.j === toCompare.j;
  }
}
