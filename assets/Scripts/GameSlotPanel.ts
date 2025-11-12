import { _decorator, Button, Component, Label } from "cc";
import { ReelMask } from "./ReelMask";
import { PlayerController, State } from "./PlayerController";
import { RNG } from "./RNG";
import { ReelsController } from "./ReelsController";
const { ccclass, property } = _decorator;

@ccclass("GameSlotPanel")
export class GameSlotPanel extends Component {
  // start() {
  // }

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

  init(playerCtrl: PlayerController) {
    this.playerCtrl = playerCtrl;
    // this.slot1Label?.node.on("Slot1", this.onStartSpin, this);
    // this.slot2Label?.node.on("Slot2", this.onStartSpin, this);
    // this.slot3Label?.node.on("SLot3", this.onStartSpin, this);
  }

  // onStartSpin() {
  //   if (this.playerCtrl.player.getBet() <= 0) return;
  //   // Deduct bet amount from player balance
  //   this.playerCtrl?.updateBalance(State.LOSS);

  //   this.slot1Label.string = Math.floor(Math.random() * 5).toString();
  //   this.slot2Label.string = Math.floor(Math.random() * 5).toString();
  //   this.slot3Label.string = Math.floor(Math.random() * 5).toString();

  //   this.reelMask.spin(0, 5, 2);

  //   this.node.emit("Slot1", this.slot1Label.string);
  //   this.node.emit("Slot2", this.slot2Label.string);
  //   this.node.emit("Slot3", this.slot3Label.string);

  //   this.spinButton.enabled = false;
  //   this.checkWin();
  // }

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

  //   // 3. Sau khi dừng, emit sự kiện kết quả
  //   // this.node.emit("spinFinished", resultIndices);
  // }

  private symbolNames = [
    "banana",
    "blueberry",
    "cherry",
    "lemon",
    "strawberry",
  ];

  async spin() {
    const resultNames: string[][] = [];

    for (let i = 0; i < this.reels.length; i++) {
      // const reelCtrl = this.reels[i];
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
      reelCtrl.spinAndStopByNames(resultNames[i])
    );
    await Promise.all(spinPromises);

    // sau khi hiển thị xong bạn có thể gửi resultNames cho evaluatePaylines
    // this.node.emit("spinFinished", resultNames);
  }

  checkWin() {
    let slot1 = parseInt(this.slot1Label!.string);
    let slot2 = parseInt(this.slot2Label!.string);
    let slot3 = parseInt(this.slot3Label!.string);
    if (
      slot1 === slot2 ||
      slot2 === slot3 ||
      (slot1 === slot2 && slot2 === slot3)
    ) {
      setTimeout(() => {
        this.playerCtrl?.updateBalance(State.WIN);
        this.node.emit("notification", true, "You Win!");
      }, 1500);
    }
    setTimeout(() => {
      this.spinButton.enabled = true;
    }, 4000);
  }
  // update(deltaTime: number) {
  // }
}
