import { _decorator, Button, Component, Label } from "cc";
import { _PLayer } from "./_Player";
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
  // start() {}

  init() {
    this.playerNameLabel.string = `${this.player.getName()}`;
    this.playerBalance.string = `${this.player.getBalance()}`;
    this.playerBet.string = `${this.player.getBet()}`;
    this.playerBetValue.string = `${this.betValue}`;
    this.playerBet?.node.on("increaseBet", this.onIncreaseBet, this);
    this.playerBet?.node.on("decreaseBet", this.onDecreaseBet, this);
    this.playerBalance?.node.on("updateBalance", this.updateBalance, this);
  }

  setBetButtonState(state: boolean) {
    this.increaseBetButton!.enabled = state;
    this.decreaseBetButton!.enabled = state;
  }

  onIncreaseBet() {
    this.player.setBet(this.betValue);
    this.playerBet.string = `${this.player.getBet()}`;
    this.node.emit("increaseBet", this.playerBet.string);
  }

  onDecreaseBet() {
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
