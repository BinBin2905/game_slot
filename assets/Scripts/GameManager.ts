import { _decorator, Button, CCInteger, Component, Label, Node } from "cc";
const { ccclass, property } = _decorator;

enum GameState {
  GS_INIT,
  GS_PLAYING,
  GS_END,
}

enum Paytable {
  DIAMOND = 0,
  BELL = 1,
  CHERRY = 2,
  BAR = 3,
  SEVEN = 4,
}

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Label })
  public slot1Label: Label | null = null;
  @property({ type: Label })
  public slot2Label: Label | null = null;
  @property({ type: Label })
  public slot3Label: Label | null = null;

  @property({ type: Node })
  public notification: Node | null = null;

  @property({ type: Label })
  public notificationLabel: Label | null = null;

  @property({ type: CCInteger })
  private _paytble: Paytable[] = [];

  @property({ type: Button })
  public spinButton: Button | null = null;

  start() {
    this.init();
    this.slot1Label?.node.on("Slot1", this.onStartSpin, this);
    this.slot2Label?.node.on("Slot2", this.onStartSpin, this);
    this.slot3Label?.node.on("SLot3", this.onStartSpin, this);
  }

  onStartSpin() {
    this.slot1Label.string = Math.floor(Math.random() * 5).toString();
    this.slot2Label.string = Math.floor(Math.random() * 5).toString();
    this.slot3Label.string = Math.floor(Math.random() * 5).toString();

    this.node.emit("Slot1", this.slot1Label.string);
    this.node.emit("Slot2", this.slot2Label.string);
    this.node.emit("Slot3", this.slot3Label.string);

    this.spinButton.enabled = false;
    this.checkWin();
  }

  init() {
    if (this.notification) this.notification.active = false;
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
      if (this.notification) {
        setTimeout(() => {
          this.notification.active = true;
          this.notificationLabel.string = "You Win!";
        }, 2000);
        setTimeout(() => {
          this.notification.active = false;
        }, 5000);
      }
    }
    setTimeout(() => {
      this.spinButton.enabled = true;
    }, 2000);
  }

  //   update(deltaTime: number) {}
}
