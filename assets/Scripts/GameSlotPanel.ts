import { _decorator, Button, Component, Label } from "cc";
import { ReelMask } from "./ReelMask";
import { PlayerController, State } from "./PlayerController";
import { RNG } from "./RNG";
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

  private playerCtrl: PlayerController;
  private rng = new RNG(12345);

  init(playerCtrl: PlayerController) {
    this.playerCtrl = playerCtrl;
    this.slot1Label?.node.on("Slot1", this.onStartSpin, this);
    this.slot2Label?.node.on("Slot2", this.onStartSpin, this);
    this.slot3Label?.node.on("SLot3", this.onStartSpin, this);
  }

  onStartSpin() {
    if (this.playerCtrl.player.getBet() <= 0) return;
    // Deduct bet amount from player balance
    this.playerCtrl?.updateBalance(State.LOSS);

    this.slot1Label.string = Math.floor(Math.random() * 5).toString();
    this.slot2Label.string = Math.floor(Math.random() * 5).toString();
    this.slot3Label.string = Math.floor(Math.random() * 5).toString();

    this.reelMask.spin(0, 5, 2);

    this.node.emit("Slot1", this.slot1Label.string);
    this.node.emit("Slot2", this.slot2Label.string);
    this.node.emit("Slot3", this.slot3Label.string);

    this.spinButton.enabled = false;
    this.checkWin();
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
