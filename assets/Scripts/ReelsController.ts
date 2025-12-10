import { _decorator, Button, Component, log } from "cc";
import { RNG } from "./RNG";
import { paylines, payTable, symbolNames } from "./config";
import { ReelMask } from "./ReelMask";
const { ccclass, property } = _decorator;

@ccclass("ReelsController")
export class ReelsController extends Component {
  @property([ReelMask])
  reels: ReelMask[] = [];

  private _isSpinning: boolean | null = null;
  private rng = new RNG();
  private spinButton: Button;

  public get _spinning(): boolean {
    return this._isSpinning;
  }

  public set _spinning(spin: boolean | null) {
    this._isSpinning = spin;
  }

  onSpinClick(spinButton: Button) {
    if (this._spinning) return;
    this._isSpinning = true;
    this.spinButton = spinButton;
    this.spinButton.interactable = false;

    this.reels.forEach((reel, colIndex) => {
      const delayTime = colIndex * 0.25;
      this.scheduleOnce(() => {
        reel.startSpin();
      }, delayTime);
    });

    let serverResult = [];
    for (let i = 0; i < this.reels.length; i++) {
      const stopIndex = this.rng.randomInt(0, this.reels.length);
      serverResult[i] = (stopIndex + i) % this.reels.length;
    }
    console.log("serverResult: ");
    console.log(serverResult);
    this.scheduleOnce(() => {
      this.stopReels(serverResult);
    }, 2.5);
  }

  stopReels(resultData: number[]) {
    resultData.forEach((resultIndex, colIndex) => {
      //column delay time = 0.5s
      const delayTime = colIndex * 0.5;

      this.scheduleOnce(() => {
        this.reels[colIndex].stopReel(resultIndex);
        if (colIndex === resultData.length - 1) {
          this.onSpinFinished();
        }
      }, delayTime);
    });
  }

  public getSpinResult(): number[][] {
    const result: number[][] = [];
    this.reels.forEach((reel) => {
      result.push(reel.getResult());
    });
    return result;
  }

  public evaluate(
    spinResult: number[][],
    lines: number[][] = paylines,
    table: any = payTable
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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]; // e.g. [1,1,1,1,1]
      const firstReelIndex = 0;
      const firstRowIndex = line[0];
      const firstSymbol = spinResult[firstReelIndex][firstRowIndex];

      if (!table[symbolNames[firstSymbol]]) {
        continue;
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
        const payout = payTable[symbolNames[firstSymbol]][count] ?? 0;
        if (payout > 0) {
          totalWin += payout;
          wins.push({
            lineIndex: i,
            symbol: symbolNames[firstSymbol],
            count,
            payout,
          });
        }
        console.log(`payout :`, payout);
      }
    }

    return { totalWin, wins };
  }

  onSpinFinished() {
    this.scheduleOnce(() => {
      this._isSpinning = false;
      this.spinButton.interactable = true;
      log("onSpinFinished");
    }, 3.0);
  }
}
