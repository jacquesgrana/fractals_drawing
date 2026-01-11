import { MathLibrary } from '../libraries/MathLibrary';

export class Color {

  private red: number;
  private green: number;
  private blue: number;
  private alpha: number;

  constructor(red: number, green: number, blue: number, alpha: number) {
    this.red = Color.capValue(red);
    this.green = Color.capValue(green);
    this.blue = Color.capValue(blue);
    this.alpha = Color.capValue(alpha);
  }

  // --- Getters ---

  public getRed(): number {
    return this.red;
  }
  public getGreen(): number {
    return this.green;
  }
  public getBlue(): number {
    return this.blue;
  }
  public getAlpha(): number {
    return this.alpha;
  }

  /*
   * Retourne une valeur entre 0 et 1 (arrondie) pour CSS
   */
  public getAlphaRatio(): number {
    return MathLibrary.round(this.alpha / 255, 3);
  }

  // --- Setters (avec protection) ---

  public setAlphaByRatio(ratio: number): void {
    // On s'assure que le résultat reste borné
    this.alpha = Color.capValue(255 * ratio);
  }

  public setRed(red: number): void {
    this.red = Color.capValue(red);
  }
  public setGreen(green: number): void {
    this.green = Color.capValue(green);
  }
  public setBlue(blue: number): void {
    this.blue = Color.capValue(blue);
  }
  public setAlpha(alpha: number): void {
    this.alpha = Color.capValue(alpha);
  }

  // --- Export & Conversion ---

  /*
   * Génère une chaîne CSS valide
   * Correction : Ajout des parenthèses manquantes sur getAlphaRatio()
   */
  public getRgbaColor(): string {
    return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.getAlphaRatio()})`;
  }

  public toString(): string {
    return `color [red : ${this.red} green : ${this.green} blue : ${this.blue} alpha : ${this.alpha}]`;
  }

  // --- Helpers ---

  /*
   * Borne la valeur entre 0 et 255 et l'arrondit à l'entier
   * Version concise utilisant Math.min/max
   */
  private static capValue(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
  }

  /*
   * Parsing robuste (gère les espaces et le format rgba/rgb)
   * Format attendu approx : "rgba(255, 0, 0, 0.5)"
   */
  public static createFromRgba(rgbaString: string): Color {
    // Nettoyage de la chaîne : on retire "rgba", "(", ")" et les espaces
    const cleanedString = rgbaString.replace(/rgba?\(|\)|\s/g, '');
    const tabVal = cleanedString.split(',');

    // Parsing sécurisé
    const red = parseInt(tabVal[0], 10) || 0;
    const green = parseInt(tabVal[1], 10) || 0;
    const blue = parseInt(tabVal[2], 10) || 0;
    
    // Pour l'alpha, on gère le cas où il n'est pas fourni (1 par défaut)
    const alphaRatio = tabVal[3] ? parseFloat(tabVal[3]) : 1;

    // Création de l'objet via le constructeur
    const colorToReturn = new Color(red, green, blue, 255);
    
    // Application du bon alpha ratio
    colorToReturn.setAlphaByRatio(alphaRatio);
    
    return colorToReturn;
  }
}
