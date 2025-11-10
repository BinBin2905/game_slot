export class RNG {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /** Linear Congruential Generator (LCG) – thuật toán cơ bản, ổn định */
  private nextSeed(): number {
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    this.seed = (a * this.seed + c) % m;
    return this.seed;
  }

  /** Trả giá trị ngẫu nhiên 0..1 */
  public random(): number {
    return this.nextSeed() / 2 ** 32;
  }

  /** Trả số nguyên trong khoảng [min, max) */
  public randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min)) + min;
  }

  /** Shuffle mảng – useful cho reel hoặc symbol */
  public shuffle<T>(array: T[]): T[] {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
