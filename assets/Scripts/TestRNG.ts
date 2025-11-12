import { _decorator, Component } from "cc";
import { RNG } from "./RNG";
const { ccclass } = _decorator;

@ccclass("TestRNG")
export class TestRNG extends Component {
  paylines = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
  ];

  payTable = {
    banana: { 3: 10, 4: 30, 5: 100 },
    blueberry: { 3: 5, 4: 15, 5: 50 },
    cherry: { 3: 3, 4: 10, 5: 30 },
    strawberry: { 3: 2, 4: 5, 5: 20 },
    lemon: { 3: 2, 4: 5, 5: 20 },
  };

  evaluatePaylines(
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
      }
    }

    return { totalWin, wins };
  }

  simulateRTP(
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

  start() {
    const rng = new RNG(12345); // seed cố định để tái lập kết quả

    // 🔹 Ví dụ 1: Random số thực
    console.log("Random float:", rng.random());

    // 🔹 Ví dụ 2: Random số nguyên 0–9
    console.log("Random int 0–9:", rng.randomInt(0, 10));

    // 🔹 Ví dụ 3: Shuffle mảng
    const arr = ["A", "B", "C", "D", "E"];
    console.log("Original:", arr);
    console.log("Shuffled:", rng.shuffle(arr));

    // 🔹 Ví dụ 4: Giả lập 5 lần quay slot (3x5)
    const reels = [
      ["banana", "cherry", "cherry", "lemon", "banana"],
      ["blueberry", "blueberry", "cherry", "banana", "lemon"],
      ["cherry", "cherry", "cherry", "lemon", "banana"],
      ["lemon", "banana", "cherry", "lemon", "blueberry"],
      ["strawberry", "lemon", "cherry", "blueberry", "strawberry"],
    ];

    for (let spin = 1; spin <= 5; spin++) {
      const result = this.spinReels(rng, reels);
      // console.log(`Spin #${spin}:`, result.map((r) => r.join(" ")).join(" | "));
      console.log(`Spin #${spin}:`, result);

      const payout = this.evaluatePaylines(
        result,
        this.paylines,
        this.payTable
      );
      console.log("Result:", payout);
    }

    this.simulateRTP(100000, 5, reels, this.paylines, this.payTable);
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
    return result;
  }
}
