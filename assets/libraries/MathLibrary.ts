export class MathLibrary {
  /**
   * Retourne la distance entre deux points
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  /**
   * Calcule le logarithme de x en base n
   * Formule : log_n(x) = ln(x) / ln(n)
   */
  static logBase(base: number, x: number): number {
    // Pas besoin de check manuel :
    // Math.log(-1) renvoie NaN (correct)
    // Math.log(0) renvoie -Infinity (correct)
    return Math.log(x) / Math.log(base);
  }

  /**
   * Convertit des Degrés en Radians
   */
  static degreeToRad(angleDegrees: number): number {
    return (angleDegrees * Math.PI) / 180;
  }

  /**
   * Convertit des Radians en Degrés
   */
  static radToDegree(angleRadians: number): number {
    return (angleRadians * 180) / Math.PI;
  }

  /**
   * Arrondit un nombre avec une précision donnée
   * Renommé de 'arr' vers 'round' pour la clarté
   *
   * @param value valeur à arrondir
   * @param decimals nombre de décimales (défaut: 0)
   */
  static round(value: number, decimals: number = 0): number {
    // Optimisation : calcul du facteur une seule fois
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
  
  /**
   * LIMITATION INTENTIONNELLE :
   * Une méthode clamp (borner) est souvent très utile dans les MathLibrary
   * pour éviter les débordements (comme dans votre classe Color).
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  static getZoomPercent(zoom: number): number {
    return zoom === 0 ? 0 : MathLibrary.round(150 / zoom, 2);
  }
}

//export default MathLibrary;
