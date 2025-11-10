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
    A: { 3: 10, 4: 30, 5: 100 },
    B: { 3: 5, 4: 15, 5: 50 },
    C: { 3: 3, 4: 10, 5: 30 },
  };

  evaluatePaylines(
    spinResult: string[][],
    paylines: number[][],
    payTable: any
  ) {
    let totalWin = 0;
    const wins: {
      lineIndex: number;
      symbol: string;
      count: number;
      payout: number;
    }[] = [];

    for (let i = 0; i < paylines.length; i++) {
      const line = paylines[i];
      const firstSymbol = spinResult[line[0]][0];
      if (!payTable[firstSymbol]) continue;

      let count = 1;

      // kiểm tra liên tiếp từ trái sang phải
      for (let reel = 1; reel < line.length; reel++) {
        const row = line[reel];
        if (spinResult[row][reel] === firstSymbol) count++;
        else break; // dừng nếu ký hiệu khác
      }

      if (count >= 3) {
        const payout = payTable[firstSymbol][count] ?? 0;
        totalWin += payout;
        wins.push({ lineIndex: i + 1, symbol: firstSymbol, count, payout });
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
      ["A", "B", "C", "A", "B"],
      ["B", "A", "C", "B", "A"],
      ["C", "B", "A", "C", "B"],
      ["A", "B", "C", "A", "B"],
      ["B", "A", "C", "B", "A"],
    ];

    for (let spin = 1; spin <= 5; spin++) {
      const result = this.spinReels(rng, reels);
      console.log(`Spin #${spin}:`, result.map((r) => r.join(" ")).join(" | "));
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
