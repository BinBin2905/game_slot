import { _decorator, Button, Component, Label, Node } from "cc";
const { ccclass, property } = _decorator;

export enum State {
  WIN,
  LOSS,
}

@ccclass("Player")
export class Player extends Component {
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

  balance: number = 1000;
  playerName: string = "Player1";
  bet: number = 10;
  betValue: number = 10;
  start() {}

  init() {
    this.playerNameLabel.string = `${this.playerName}`;
    this.playerBalance.string = `${this.balance}`;
    this.playerBet.string = `${this.bet}`;
    this.playerBetValue.string = `${this.betValue}`;
    this.playerBet?.node.on("increaseBet", this.onIncreaseBet, this);
    this.playerBet?.node.on("decreaseBet", this.onDecreaseBet, this);
    this.playerBalance?.node.on("updateBalance", this.updateBalance, this);
  }

  onIncreaseBet() {
    this.bet += this.betValue;
    this.playerBet.string = `${this.bet}`;
    this.node.emit("increaseBet", this.playerBet.string);
  }

  onDecreaseBet() {
    if (this.bet > 0) this.bet -= this.betValue;
    this.playerBet.string = `${this.bet}`;
    this.node.emit("increaseBet", this.playerBet.string);
  }

  updateBalance(state: State) {
    if (state === State.WIN) {
      this.balance += this.bet;
    } else if (state === State.LOSS) {
      this.balance -= this.bet;
    }
    this.playerBalance.string = `${this.balance}`;
    this.node.emit("updateBalance", this.playerBalance.string);
  }

  update(deltaTime: number) {}
}
