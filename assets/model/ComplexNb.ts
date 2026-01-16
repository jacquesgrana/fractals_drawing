import { MathLibrary } from "../libraries/MathLibrary";


export class ComplexNb {
  private real!: number;
  private imag!: number;
  private mod!: number;
  private arg!: number;

  constructor(isCart: boolean, value1: number, value2: number) {
    if (isCart) {
      this.real = value1;
      this.imag = value2;
      this.syncFromCartesian(); // Centralisation du calcul
    } else {
      this.mod = value1;
      this.arg = value2;
      this.syncFromPolar();     // Centralisation du calcul
    }
  }

  // --- AMÉLIORATION MAJEURE ICI ---
  
  /**
   * Recalcule Module et Argument depuis Réel et Imaginaire.
   * Utilise Math.hypot pour la précision du module.
   * Normalise l'argument entre [0, 360[.
   */
  private syncFromCartesian(): void {
    // 1. Math.hypot est plus robuste que sqrt(x*x + y*y) pour les grands nombres
    this.mod = Math.hypot(this.real, this.imag);

    // 2. Math.atan2 gère les quadrants correctement (-PI à +PI)
    const radArg = Math.atan2(this.imag, this.real);
    
    // 3. Conversion en degrés
    let degArg = MathLibrary.radToDegree(radArg);

    // 4. Normalisation pour avoir un angle positif [0, 360[
    // Ex: atan2 renvoie -90 pour (0, -1), on veut souvent 270 degrés.
    if (degArg < 0) {
      degArg += 360;
    }
    
    this.arg = degArg;
  }

  /**
   * Recalcule Réel et Imaginaire depuis Module et Argument.
   */
  private syncFromPolar(): void {
    const radArg = MathLibrary.degreeToRad(this.arg);
    this.real = this.mod * Math.cos(radArg);
    this.imag = this.mod * Math.sin(radArg);
  }

  // --- MÉTHODES PUBLIQUES ---

  // On peut supprimer updateTrigo et updateCart car tout est géré automatiquement
  // par les méthodes privées syncFrom... appelées dans les setters.

  conj(): ComplexNb {
    return new ComplexNb(true, this.real, -1 * this.imag);
  }

  add(toAdd: ComplexNb): ComplexNb {
    return new ComplexNb(true, this.real + toAdd.real, this.imag + toAdd.imag);
  }

  sub(toSub: ComplexNb): ComplexNb {
    return new ComplexNb(true, this.real - toSub.real, this.imag - toSub.imag);
  }

  mult(toMult: ComplexNb): ComplexNb {
    // Optimisation : Multiplication en polaire est souvent plus simple mathématiquement
    // (mod * mod, arg + arg), mais ici on reste en cartésien pour la constance.
    return new ComplexNb(
      true,
      this.real * toMult.real - this.imag * toMult.imag,
      this.real * toMult.imag + this.imag * toMult.real
    );
  }

  div(toDiv: ComplexNb): ComplexNb {
    // Protection division par zéro
    if (toDiv.mod === 0) throw new Error("Division by zero");
    
    const modSq = toDiv.mod * toDiv.mod;
    return new ComplexNb(
      true,
      (this.real * toDiv.real + this.imag * toDiv.imag) / modSq,
      (this.imag * toDiv.real - this.real * toDiv.imag) / modSq
    );
  }

  // --- SETTERS CORRIGÉS ---
  // Il est CRUCIAL de mettre à jour les valeurs duales quand on change une valeur.
  // Sinon : instance.setReal(10); instance.getMod() renvoyait l'ancien module !

  setReal(real: number): void {
    this.real = real;
    this.syncFromCartesian(); // Mise à jour auto de mod/arg
  }

  setImag(imag: number): void {
    this.imag = imag;
    this.syncFromCartesian();
  }

  setMod(mod: number): void {
    this.mod = mod;
    this.syncFromPolar(); // Mise à jour auto de real/imag
  }

  setArg(arg: number): void {
    this.arg = arg;
    this.syncFromPolar();
  }

  // --- GETTERS ---

  getReal(): number { return this.real; }
  getImag(): number { return this.imag; }
  getMod(): number { return this.mod; }
  getArg(): number { return this.arg; }

  clone(): ComplexNb {
    return new ComplexNb(true, this.real, this.imag);
  }

  toString(): string {
    return `Z = ${this.real.toFixed(2)} + i${this.imag.toFixed(2)} (Mod: ${this.mod.toFixed(2)}, Arg: ${this.arg.toFixed(2)}°)`;
  }

  toJSON(): object {
    return {
      real: this.real,
      imag: this.imag,
      mod: this.mod,
      arg: this.arg
    };
  } 

  static fromJSON(json: {
    isCart: boolean;
    real: number;
    imag: number;
    mod: number;
    arg: number;
  }): ComplexNb {
    
    return new ComplexNb(true, json.real, json.imag);
  }
}
