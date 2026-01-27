import { Matrix } from "../model/Matrix";
import { MathLibrary } from "./MathLibrary";

import { Point } from "../model/Point";
import { CanvasConfig } from "../config/CanvasConfig";
import ToastFacade from "../facade/ToastFacade";

//const MATRIX_DETERMINANT_MIN = 0.0000000000000000001;

export class MatrixLibrary {

  // ==========================================
  // OUTILS DE CRÉATION RAPIDE (TRANSFORMATIONS)
  // ==========================================

  /**
   * Crée une matrice Identité (diagonale de 1) de taille n
   */
  static createIdentity(n: number): Matrix {
    const mat = new Matrix(n, n);
    const data = mat.getValues();
    if (data) {
        for (let i = 0; i < n; i++) data[i][i] = 1;
    }
    return mat;
  }

  /**
   * Crée une matrice de translation 3x3
   * [ 1  0  dx ]
   * [ 0  1  dy ]
   * [ 0  0  1  ]
   */
  static createTranslation(dx: number, dy: number): Matrix {
    const mat = MatrixLibrary.createIdentity(3);
    mat.setValueAt(0, 2, dx);
    mat.setValueAt(1, 2, dy);
    return mat;
  }

  /**
   * Crée une matrice de mise à l'échelle (Scale) 3x3
   * [ sx 0  0 ]
   * [ 0  sy 0 ]
   * [ 0  0  1 ]
   */
  static createScaling(sx: number, sy: number): Matrix {
    const mat = MatrixLibrary.createIdentity(3);
    const data = mat.getValues();
    if (data) {
        data[0][0] = sx;
        data[1][1] = sy;
    }
    return mat;
  }

  /**
   * Crée une matrice de rotation 3x3
   * [ cos  -sin  0 ]
   * [ sin   cos  0 ]
   * [  0     0   1 ]
   */
  static createRotation(angleDegrees: number): Matrix {
    const rad = MathLibrary.degreeToRad(angleDegrees);
    const c = Math.cos(rad);
    const s = Math.sin(rad);

    const mat = MatrixLibrary.createIdentity(3);
    const data = mat.getValues();
    if (data) {
        data[0][0] = c;
        data[0][1] = -s;
        data[1][0] = s;
        data[1][1] = c;
    }
    return mat;
  }

  /**
   * Applique une matrice 3x3 à un Point 2D
   * Le point (x, y) est traité comme le vecteur [x, y, 1]
   */
  static transformPoint(matrix: Matrix, point: Point): Point {
    const values = matrix.getValues();
    if (!values || matrix.getNcols() !== 3) {
        throw new Error("Transformation requires a 3x3 matrix");
    }

    const x = point.getX();
    const y = point.getY();

    // Formule : Ax + By + Cz (avec z=1)
    const newX = (values[0][0] * x) + (values[0][1] * y) + values[0][2];
    const newY = (values[1][0] * x) + (values[1][1] * y) + values[1][2];

    return new Point(newX, newY); 
  }

  // ==========================================
  // OPÉRATIONS MATRICIELLES CLASSIQUES
  // ==========================================

  /**
   * Transpose : Échange les lignes et les colonnes.
   */
  static transpose(matrix: Matrix): Matrix {
    const rows = matrix.getNrows();
    const cols = matrix.getNcols();
    const result = new Matrix(cols, rows);
    
    // Accès direct aux données pour la rapidité
    const src = matrix.getValues();
    const dest = result.getValues(); // Suppose que Matrix expose getValues() retourne number[][]

    if (!src || !dest) throw new Error("Matrix data is null");

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        dest[j][i] = src[i][j];
      }
    }
    return result;
  }

  /**
   * Inverse via la méthode de la co-matrice.
   * A^-1 = (1/det(A)) * Transpose(Cofactor(A))
   */
  static inverse(matrix: Matrix): Matrix {
    if (!matrix.isSquare()) {
       throw new Error("Cannot invert a non-square matrix.");
    }

    const det = MatrixLibrary.determinant(matrix);

    /*
    // Attention aux erreurs d'arrondi des flottants, on compare avec un epsilon très petit
    if (Math.abs(det) < CanvasConfig.MATRIX_DETERMINANT_LIMIT_MIN) {
      //throw new Error("Matrix is singular (determinant is 0), cannot be inverted.");
      ToastFacade.error("La matrice est singulière (determinant est très proche de 0)");
    }
    */

    const cofactorParams = MatrixLibrary.cofactor(matrix);
    const transposedCofactor = MatrixLibrary.transpose(cofactorParams);
    
    return transposedCofactor.multiplyByConstant(1.0 / det);
  }

  /**
   * Déterminant (Méthode récursive de Laplace).
   * Note : Très lent pour des matrices > 8x8.
   */
  static determinant(matrix: Matrix): number {
    if (!matrix.isSquare()) {
      throw new Error("Determinant can only be calculated for square matrices.");
    }

    const n = matrix.getNrows();
    const data = matrix.getValues();

    if (!data) return 0;

    // Cas de base : 1x1
    if (n === 1) {
      return data[0][0];
    }

    // Cas optimisé : 2x2 (ad - bc)
    if (n === 2) {
      return (data[0][0] * data[1][1]) - (data[0][1] * data[1][0]);
    }

    if (n === 3) {
      // Règle de Sarrus (immédiat, pas de boucles)
      return (data[0][0] * data[1][1] * data[2][2]) +
             (data[0][1] * data[1][2] * data[2][0]) +
             (data[0][2] * data[1][0] * data[2][1]) -
             (data[0][2] * data[1][1] * data[2][0]) -
             (data[0][1] * data[1][0] * data[2][2]) -
             (data[0][0] * data[1][2] * data[2][1]);
    }

    let sum = 0;
    // Développement selon la première ligne (row 0)
    for (let j = 0; j < n; j++) {
      // Signe alterné : + - + - ...
      const sign = (j % 2 === 0) ? 1 : -1;
      const subMatrix = MatrixLibrary.createSubMatrix(matrix, 0, j);
      
      sum += sign * data[0][j] * MatrixLibrary.determinant(subMatrix);
    }
    return sum;
  }

  /**
   * Crée une sous-matrice en retirant la ligne et la colonne indiquées.
   */
  static createSubMatrix(matrix: Matrix, excludingRow: number, excludingCol: number): Matrix {
    const rows = matrix.getNrows();
    const cols = matrix.getNcols();
    const result = new Matrix(rows - 1, cols - 1);
    
    const src = matrix.getValues();
    const dest = result.getValues();

    if(!src || !dest) throw new Error("Matrix corrupt");

    let r = -1; 
    
    for (let i = 0; i < rows; i++) {
      if (i === excludingRow) continue;
      r++;
      let c = -1;
      
      for (let j = 0; j < cols; j++) {
        if (j === excludingCol) continue;
        c++;
        dest[r][c] = src[i][j];
      }
    }
    return result;
  }

  /**
   * Matrice des cofacteurs.
   * C_ij = (-1)^(i+j) * det(SubMatrix_ij)
   */
  static cofactor(matrix: Matrix): Matrix {
    const n = matrix.getNrows();
    const result = new Matrix(n, n);
    const dest = result.getValues();

    if(!dest) throw new Error("Matrix error");

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const sign = ((i + j) % 2 === 0) ? 1 : -1;
        const subDet = MatrixLibrary.determinant(MatrixLibrary.createSubMatrix(matrix, i, j));
        dest[i][j] = sign * subDet;
      }
    }
    return result;
  }

  /**
   * Addition de deux matrices (A + B)
   */
  static add(matrix1: Matrix, matrix2: Matrix): Matrix {
    if (matrix1.getNrows() !== matrix2.getNrows() || matrix1.getNcols() !== matrix2.getNcols()) {
      throw new Error("Matrices must have the same dimensions for addition.");
    }

    const rows = matrix1.getNrows();
    const cols = matrix1.getNcols();
    const result = new Matrix(rows, cols);
    
    const m1 = matrix1.getValues();
    const m2 = matrix2.getValues();
    const res = result.getValues();

    // Boucle directe sur les tableaux
    if (m1 && m2 && res) {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                res[i][j] = m1[i][j] + m2[i][j];
            }
        }
    }
    return result;
  }

  /**
   * Soustraction (A - B)
   */
  static subtract(matrix1: Matrix, matrix2: Matrix): Matrix {
    // Optimisation : A + (-1 * B) est moins performant car crée 2 matrices intermédiaires.
    // Mieux vaut réécrire la boucle de soustraction, mais utiliser add() avec multiply est acceptable.
    return MatrixLibrary.add(matrix1, matrix2.multiplyByConstant(-1));
  }

  /**
   * Multiplication matricielle (A * B)
   * Le nombre de colonnes de A doit égaler le nombre de lignes de B.
   */
  static multiply(matrix1: Matrix, matrix2: Matrix): Matrix {
    if (matrix1.getNcols() !== matrix2.getNrows()) {
      throw new Error("Invalid dimensions for multiplication: Cols(A) != Rows(B).");
    }

    const m1Rows = matrix1.getNrows();
    const commonDim = matrix1.getNcols(); // = matrix2.getNrows()
    const m2Cols = matrix2.getNcols();

    const result = new Matrix(m1Rows, m2Cols);
    
    const m1 = matrix1.getValues();
    const m2 = matrix2.getValues();
    const res = result.getValues();

    if (m1 && m2 && res) {
        for (let i = 0; i < m1Rows; i++) {
            for (let j = 0; j < m2Cols; j++) {
                let sum = 0;
                for (let k = 0; k < commonDim; k++) {
                sum += m1[i][k] * m2[k][j];
                }
                res[i][j] = sum;
            }
        }
    }
    return result;
  }
}
