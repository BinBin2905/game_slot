import { _decorator, AudioSource, Button, Component, Label } from "cc";
import { _PLayer } from "./_Player";
import { AudioController } from "./AudioController";
const { ccclass, property } = _decorator;

export enum State {
  WIN,
  LOSS,
}

@ccclass("PlayerController")
export class PlayerController extends Component {
  @property({ type: Label })
  public playerNameLabel: Label | null = null;

  @property({ type: Label })
  public playerBalance: Label | null = null;

  @property({ type: Label })
  public playerBet: Label | null = null;

  @property({ type: Label })
  public playerBetValue: Label | null = null;

  @property({ type: Button })
  public increaseBetButton: Button | null = null;
  @property({ type: Button })
  public decreaseBetButton: Button | null = null;
  betValue: number = 10;

  player: _PLayer = new _PLayer("Player1", 1000);
  private increaseAudio: AudioController = new AudioController();
  private decreaseAudio: AudioController = new AudioController();

  init() {
    this.playerNameLabel.string = `${this.player.getName()}`;
    this.playerBalance.string = `${this.player.getBalance()}`;
    this.playerBet.string = `${this.player.getBet()}`;
    this.playerBetValue.string = `${this.betValue}`;
    this.playerBet?.node.on("increaseBet", this.onIncreaseBet, this);
    this.playerBet?.node.on("decreaseBet", this.onDecreaseBet, this);
    this.playerBalance?.node.on("updateBalance", this.updateBalance, this);
    let increaseSound = this.increaseBetButton.getComponent(AudioSource);
    this.increaseAudio.init(increaseSound);
    let decreaseSound = this.decreaseBetButton!.getComponent(AudioSource);
    this.decreaseAudio.init(decreaseSound);
  }

  setBetButtonState(state: boolean) {
    this.increaseBetButton!.enabled = state;
    this.decreaseBetButton!.enabled = state;
  }

  onIncreaseBet() {
    this.increaseAudio.play();
    this.player.setBet(this.betValue);
    this.playerBet.string = `${this.player.getBet()}`;
    this.node.emit("increaseBet", this.playerBet.string);
  }

  onDecreaseBet() {
    this.decreaseAudio.play();
    if (this.player.getBet() > 0) this.player.setBet(-this.betValue);
    this.playerBet.string = `${this.player.getBet()}`;
    this.node.emit("increaseBet", this.playerBet.string);
  }

  updateBalance(state: State, amount: number = 0) {
    if (state === State.WIN) {
      this.player.updateBalance(amount);
    } else if (state === State.LOSS) {
      this.player.updateBalance(-amount);
    }
    this.playerBalance.string = `${this.player.getBalance()}`;
    this.node.emit("updateBalance", this.playerBalance.string);
  }

  // update(deltaTime: number) {}
}
