import { _decorator, Button, Component, Label } from "cc";
import { ReelMask } from "./ReelMask";
import { PlayerController, State } from "./PlayerController";
import { RNG } from "./RNG";
import { ReelsController } from "./ReelsController";
const { ccclass, property } = _decorator;

type evaluateResult = {
  totalWin: number;
  wins: {
    lineIndex: number;
    symbol: string;
    count: number;
    payout: number;
  }[];
};
@ccclass("GameSlotPanel")
export class GameSlotPanel extends Component {
  @property({ type: Button })
  public spinButton: Button;

  @property(ReelsController)
  private reelsController: ReelsController;

  private playerCtrl: PlayerController;

  init(playerCtrl: PlayerController) {
    this.playerCtrl = playerCtrl;
  }

  spin() {
    this.playerCtrl.updateBalance(State.LOSS, this.playerCtrl.player.getBet()); // trừ tiền cược
    this.reelsController.onSpinClick(this.spinButton);
  }

  checkWin(resultNames: number[][]) {
    let evaluation: evaluateResult = this.reelsController.evaluate(resultNames);
    console.log("Evaluation result:", evaluation);
    if (evaluation.totalWin > 0) {
      this.playerCtrl.updateBalance(
        State.WIN,
        evaluation.totalWin * this.playerCtrl.player.getBet()
      );
      this.node.emit("notification", true, `You win ${evaluation.totalWin}!`);
    }
  }

  update() {
    if (
      !this.reelsController._spinning &&
      this.reelsController._spinning !== null
    ) {
      console.log("Payout");
      this.checkWin(this.reelsController.getSpinResult());
      this.reelsController._spinning = null;
      return;
    }
  }
}
