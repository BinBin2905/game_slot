import { _decorator, Button, Component, Label } from "cc";
import { ReelMask } from "./ReelMask";
import { PlayerController, State } from "./PlayerController";
import { RNG } from "./RNG";
import { ReelsController } from "./ReelsController";
const { ccclass, property } = _decorator;

@ccclass("GameSlotPanel")
export class GameSlotPanel extends Component {
  @property({ type: Button })
  public spinButton: Button | null = null;

  @property({ type: Label })
  public slot1Label: Label | null = null;
  @property({ type: Label })
  public slot2Label: Label | null = null;
  @property({ type: Label })
  public slot3Label: Label | null = null;

  @property({ type: ReelMask })
  public reelMask: ReelMask | null = null;

  @property({ type: ReelsController })
  public reels: ReelsController[] = [];

  private rng = new RNG();

  private playerCtrl: PlayerController;
  private symbolNames = [
    "banana",
    "blueberry",
    "cherry",
    "lemon",
    "strawberry",
  ];

  init(playerCtrl: PlayerController) {
    this.playerCtrl = playerCtrl;
  }

  // public async spin() {
  //   // 1. Generage kết quả ngẫu nhiên
  //   const resultIndices: number[][] = [];
  //   for (let i = 0; i < this.reels.length; i++) {
  //     const stop = this.rng.randomInt(0, this.reels[i].symbolFrames.length);
  //     resultIndices[i] = [
  //       stop,
  //       (stop + 1) % this.reels[i].symbolFrames.length,
  //       (stop + 2) % this.reels[i].symbolFrames.length,
  //     ];
  //   }

  //   // 2. Bật hiệu ứng quay cho mỗi reel
  //   const spinPromises = this.reels.map((reelCtrl, i) =>
  //     reelCtrl.spinAndStop(resultIndices[i])
  //   );
  //   await Promise.all(spinPromises);
  // }

  async spin() {
    const resultNames: string[][] = [];
    this.spinButton.enabled = false;
    for (let i = 0; i < this.reels.length; i++) {
      const stopIndex = this.rng.randomInt(0, this.symbolNames.length);
      // giả sử lấy 3 biểu tượng liên tiếp theo tên
      const visibleNames = [
        this.symbolNames[stopIndex],
        this.symbolNames[(stopIndex + 1) % this.symbolNames.length],
        this.symbolNames[(stopIndex + 2) % this.symbolNames.length],
      ];
      resultNames.push(visibleNames);

      // hiển thị ngay cho cuộn i
      // reelCtrl.showSymbolsByName(visibleNames);
    }

    const spinPromises = this.reels.map((reelCtrl, i) =>
      //  console.log("Spinning reel", i, "to", resultNames[i])
      reelCtrl.spinAndStopByNames(resultNames[i])
    );
    await Promise.all(spinPromises);
    this.checkWin();
  }

  checkWin() {
    setTimeout(() => {
      this.spinButton.enabled = true;
    }, 2000);
  }
}
