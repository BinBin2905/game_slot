import { _decorator, AudioSource, Component, Label, Node } from "cc";
import { PlayerController } from "./PlayerController";
import { GameSlotPanel } from "./GameSlotPanel";
import { AudioController } from "./AudioController";
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
  @property({ type: Node })
  public notification: Node | null = null;

  @property({ type: Label })
  public notificationLabel: Label | null = null;

  @property({ type: PlayerController })
  public playerCtrl: PlayerController | null = null;

  @property({ type: GameSlotPanel })
  public gameSlotPanel: GameSlotPanel | null = null;

  private audioController: AudioController = new AudioController();

  start() {
    this.setCurrentState(GameState.GS_INIT);
    this.gameSlotPanel?.node.on(
      "notification",
      (state: boolean, message: string) => {
        this.notificationHandler(state, message);
      },
      this
    );
  }

  setCurrentState(state: GameState) {
    switch (state) {
      case GameState.GS_INIT:
        this.init();
        break;
      case GameState.GS_PLAYING:
        break;
      case GameState.GS_END:
        break;
    }
  }

  init() {
    this.notification!.active = false;
    this.audioController.init(this.notification.getComponent(AudioSource));
    this.playerCtrl?.init();
    this.gameSlotPanel.init(this.playerCtrl);
  }

  notificationHandler(status: boolean, message: string) {
    // console.log("Notification:", status, message);
    this.notificationLabel.string = message;
    this.notification!.active = status;
    this.audioController.play();
    if (status) {
      setTimeout(() => {
        this.notification!.active = false;
      }, 3000);
    }
  }
  //   update(deltaTime: number) {}
}
