export class Matrix {
  // Plus besoin de "!", on garantit l'init dans le constructeur
  private nrows: number;
  private ncols: number;
  // Plus de Nullable, la donnée existe toujours
  private data: number[][];

  constructor(nrows: number, ncols: number) {
    this.nrows = nrows;
    this.ncols = ncols;
    // Initialisation propre avec des zéros (évite les valeurs undefined)
    this.data = Array.from({ length: nrows }, () => new Array(ncols).fill(0));
  }

  // --- Getters / Setters ---

  getNrows(): number {
    return this.nrows;
  }
  // Suppression de setNrows pour éviter la désynchronisation avec this.data

  getNcols(): number {
    return this.ncols;
  }
  // Suppression de setNcols

  getValues(): number[][] {
    return this.data;
  }

  /*
   * Met à jour les valeurs et les dimensions pour garder la cohérence
   */
  setValues(values: number[][]): void {
    if (!values || values.length === 0) return; // Sécurité de base
    
    this.data = values;
    this.nrows = values.length;
    this.ncols = values[0].length;
  }

  setValueAt(row: number, col: number, value: number): void {
    // Vérification de sécurité optionnelle mais recommandée
    if (this.isValidIndex(row, col)) {
      this.data[row][col] = value;
    }
  }

  // Retourne uniquement un number (plus de any, plus de null)
  getValueAt(row: number, col: number): number {
    if (this.isValidIndex(row, col)) {
      return this.data[row][col];
    }
    throw new Error(`Index hors limites: [${row}][${col}]`);
  }

  // Helper privé pour vérifier les bornes
  private isValidIndex(row: number, col: number): boolean {
    return row >= 0 && row < this.nrows && col >= 0 && col < this.ncols;
  }

  // --- Méthodes Métier ---

  isSquare(): boolean {
    return this.nrows === this.ncols;
  }

  getSize(): number {
    return this.isSquare() ? this.nrows : -1;
  }

  multiplyByConstant(constant: number): Matrix {
    const result = new Matrix(this.nrows, this.ncols);
    
    // Optimisation : boucle directe sans passer par les getters/setters
    // pour éviter la surcharge d'appels de fonction
    for (let i = 0; i < this.nrows; i++) {
      for (let j = 0; j < this.ncols; j++) {
        result.data[i][j] = this.data[i][j] * constant;
      }
    }
    return result;
  }

  /* 
   * Ajoute une colonne de "1" à gauche (souvent utilisé pour le Biais en Machine Learning)
   */
  insertColumnWithValue1(): Matrix {
    const result = new Matrix(this.nrows, this.ncols + 1);

    for (let i = 0; i < this.nrows; i++) {
        // La colonne 0 vaut 1.0
        result.data[i][0] = 1.0;
        
        // On copie le reste en décalant
        for (let j = 0; j < this.ncols; j++) {
            result.data[i][j + 1] = this.data[i][j];
        }
    }
    return result;
  }

  toString(): string {
    // Utilisation de map et join pour éviter la concaténation lourde dans une boucle
    return this.data
      .map((row, index) => `l${index} :: ` + row.join(" : "))
      .join("\n") + "\n";
  }
}
