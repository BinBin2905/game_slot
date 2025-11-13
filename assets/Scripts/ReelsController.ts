import { _decorator, Component, Node, Sprite, SpriteFrame } from "cc";
import { RNG } from "./RNG";
const { ccclass, property } = _decorator;

@ccclass("ReelsController")
export class ReelsController extends Component {
  @property({ type: SpriteFrame })
  public symbolFrames: SpriteFrame[] = [];

  @property({ type: Node })
  public row0: Node | null = null!;
  @property({ type: Node })
  public row1: Node | null = null!;
  @property({ type: Node })
  public row2: Node | null = null!;

  @property({ type: String })
  public symbolNames: string[] = [];

  private paylines = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
  ];

  private payTable = {
    banana: { 3: 10, 4: 30, 5: 100 },
    blueberry: { 3: 5, 4: 15, 5: 50 },
    cherry: { 3: 3, 4: 10, 5: 30 },
    lemon: { 3: 2, 4: 5, 5: 20 },
    strawberry: { 3: 2, 4: 5, 5: 20 },
  };

  // Hàm hiển thị 3 biểu tượng theo kết quả
  public showSymbols(symbolIndices: number[]) {
    this.row0.getComponent(Sprite)!.spriteFrame =
      this.symbolFrames[symbolIndices[0]];
    this.row1.getComponent(Sprite)!.spriteFrame =
      this.symbolFrames[symbolIndices[1]];
    this.row2.getComponent(Sprite)!.spriteFrame =
      this.symbolFrames[symbolIndices[2]];
  }

  showSymbolsByName(symbolNameArray: string[]) {
    for (let i = 0; i < symbolNameArray.length; i++) {
      const name = symbolNameArray[i];
      const idx = this.symbolNames.indexOf(name);
      // console.log("Showing symbol", name, "at index", idx);
      if (idx >= 0 && this.symbolFrames[idx]) {
        if (i === 0 && this.row0)
          this.row0.getComponent(Sprite)!.spriteFrame = this.symbolFrames[idx];
        if (i === 1 && this.row1)
          this.row1.getComponent(Sprite)!.spriteFrame = this.symbolFrames[idx];
        if (i === 2 && this.row2)
          this.row2.getComponent(Sprite)!.spriteFrame = this.symbolFrames[idx];
      } else {
        console.warn(`Symbol name not found: ${name}`);
      }
    }
  }

  // Hàm quay animation (ví dụ xoay nhanh rồi dừng)
  public async spinAndStop(targetIndices: number[]) {
    // chạy hiệu ứng quay: thay đổi nhanh biểu tượng
    const duration = 1.0; // 1 giây
    const interval = 0.1;
    const startTime = performance.now();
    while (performance.now() - startTime < duration * 1000) {
      const randIdx = Math.floor(Math.random() * this.symbolFrames.length);
      this.showSymbols([randIdx, randIdx, randIdx]);
      await new Promise((r) => setTimeout(r, interval * 1000));
    }
    // dừng tại target
    this.showSymbols(targetIndices);
  }

  public async spinAndStopByNames(targetIndices: string[]) {
    // console.log("Spinning to", targetIndices);
    // chạy hiệu ứng quay: thay đổi nhanh biểu tượng
    const duration = 1.0; // 1 giây
    const interval = 0.1;
    const startTime = performance.now();
    while (performance.now() - startTime < duration * 1000) {
      // const randIdx = Math.floor(Math.random() * this.symbolFrames.length);
      this.showSymbolsByName(targetIndices);
      await new Promise((r) => setTimeout(r, interval * 1000));
    }
    // dừng tại target
    this.showSymbolsByName(targetIndices);
  }

  private spinReels(rng: RNG, reels: string[][]): string[][] {
    const result: string[][] = [];
    for (let reel = 0; reel < reels.length; reel++) {
      // console.log("Reel", reel, "length", reels.length);
      const stop = rng.randomInt(0, reels[reel].length);
      const visible = [
        reels[reel][(stop + 0) % reels[reel].length],
        reels[reel][(stop + 1) % reels[reel].length],
        reels[reel][(stop + 2) % reels[reel].length],
      ];
      result.push(visible);
    }
    console.log("Spin result:", result);
    return result;
  }

  public evaluatePaylines(
    spinResult: string[][],
    paylines: number[][],
    payTable: any
  ): {
    totalWin: number;
    wins: {
      lineIndex: number;
      symbol: string;
      count: number;
      payout: number;
    }[];
  } {
    const totalReels = spinResult.length; // e.g. 5
    let totalWin = 0;
    const wins = [];

    for (let i = 0; i < paylines.length; i++) {
      const line = paylines[i]; // e.g. [1,1,1,1,1]
      const firstReelIndex = 0;
      const firstRowIndex = line[0];
      const firstSymbol = spinResult[firstReelIndex][firstRowIndex];

      if (!payTable[firstSymbol]) {
        continue; // biểu tượng này không có trong trả thưởng
      }

      let count = 1;
      for (let reel = 1; reel < totalReels; reel++) {
        const rowIndex = line[reel];
        if (spinResult[reel][rowIndex] === firstSymbol) {
          count++;
        } else {
          break;
        }
      }

      if (count >= 3) {
        const payout = payTable[firstSymbol][count] ?? 0;
        if (payout > 0) {
          totalWin += payout;
          wins.push({ lineIndex: i, symbol: firstSymbol, count, payout });
        }
        console.log(`payout :`, payout);
      }
    }

    return { totalWin, wins };
  }

  private simulateRTP(
    spins: number,
    betAmount: number,
    reels: string[][],
    paylines: number[][],
    payTable: any
  ) {
    const rng = new RNG(12345); // seed cố định để tái lập
    let totalWin = 0;

    for (let i = 0; i < spins; i++) {
      const spinResult = this.spinReels(rng, reels);
      const result = this.evaluatePaylines(spinResult, paylines, payTable);
      totalWin += result.totalWin * betAmount;
    }

    const totalBet = spins * betAmount;
    const rtp = (totalWin / totalBet) * 100;

    console.log(`🎰 Simulated ${spins} spins`);
    console.log(`Total bet: ${totalBet}`);
    console.log(`Total payout: ${totalWin}`);
    console.log(`📊 RTP = ${rtp.toFixed(2)}%`);
  }
}
