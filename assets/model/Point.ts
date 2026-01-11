import { MathLibrary } from "../libraries/MathLibrary";

/*
 * Classe représentant un point du plan des réels
 */
export class Point {
  private x: number;
  private y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setX(x: number): void {
    this.x = x;
  }

  setY(y: number): void {
    this.y = y;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  toString(): string {
    return `x : ${this.x} y : ${this.y}`;
  }

  toJSON(): object {
    return {
      x: this.x,
      y: this.y
    };
  }

  static fromJSON(json: {
    x: number;
    y: number;
  }): Point {
    return new Point(json.x, json.y);
  }

  calcMagnitude(): number {
    return Math.hypot(this.x, this.y);
  }

  calcAngle(): number {
    const angle = MathLibrary.radToDegree(Math.atan2(this.y, this.x));
    return angle < 0 ? angle + 360 : angle;
  }

  calcDist(endPoint: Point): number {
    return Math.hypot(endPoint.getX() - this.x, endPoint.getY() - this.y);
  }
}
