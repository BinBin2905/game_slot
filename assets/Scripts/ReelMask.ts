import {
  _decorator,
  Component,
  instantiate,
  Node,
  Prefab,
  Sprite,
  SpriteFrame,
  tween,
  UITransform,
  Vec3,
} from "cc";
import { RNG } from "./RNG";
const { ccclass, property } = _decorator;

@ccclass("ReelMask")
export class ReelMask extends Component {
  @property(Node)
  symbolsNode: Node = null;

  @property(Prefab)
  symbolPrefab: Prefab = null;

  @property([SpriteFrame])
  textures: SpriteFrame[] = [];

  @property(Node)
  mask: Node = null;

  @property
  gap: number = 10;

  private _symbols: Node[] = [];
  private _isSpinning: boolean = false;
  private _speed: number = 1000;
  private _resultIndex: number = -1;
  private _stopSignal: boolean = false;
  private _symbolHeight: number = 40;
  private _symbolWidth: number = 40;
  private _result: number[] = [];
  private rng = new RNG();

  private get _slotStep(): number {
    return this._symbolHeight + this.gap;
  }

  //onLoad() run before every function
  onLoad() {
    this.initReel();
  }

  initReel() {
    this._symbols = [];
    this.symbolsNode.removeAllChildren();

    for (let i = 0; i < 5; i++) {
      let item = instantiate(this.symbolPrefab);
      item.parent = this.symbolsNode;
      item.getComponent(UITransform).height = this._symbolHeight;
      item.getComponent(UITransform).width = this._symbolWidth;

      item.setPosition(new Vec3(0, i * this._slotStep, 0));
      this.setSymbolTexture(
        item,
        Math.floor(Math.random() * (this.textures.length - 1))
      );
      this._symbols.push(item);
    }
    if (this.mask) {
      this.mask.getComponent(UITransform).height =
        3 * this._symbolHeight + 2 * this.gap;
    }
  }

  public startSpin() {
    this._stopSignal = false;
    this._isSpinning = true;
  }

  public stopReel(resultIndex: number) {
    this._resultIndex = resultIndex;
    this._stopSignal = true;
  }

  private handleStopLogic() {
    this._isSpinning = false;

    //Arrange symbols to the exact order
    this._symbols.sort((a, b) => a.position.y - b.position.y);

    this._symbols.forEach((symbol, index) => {
      const targetY = index * this._slotStep;
      const stopIndex = this.rng.randomInt(0, 3);
      if (index == stopIndex % this._symbols.length) {
        symbol.getComponent(Sprite).spriteFrame =
          this.textures[this._resultIndex];
      }
      tween(symbol)
        .to(0.5, { position: new Vec3(0, targetY, 0) }, { easing: "backOut" })
        .call(() => {
          if (index === this._symbols.length - 1) {
            //Reset flag when the last column finish
            this._stopSignal = false;
          }
        })
        .start();
    });
    this._result = this.columnResult(this._symbols);
  }
  public getResult(): number[] {
    return this._result;
  }
  private columnResult(symbols: Node[], columnItems: number = 3): number[] {
    const result: number[] = [];
    for (let i = 0; i < columnItems; i++) {
      result.push(
        this.textures.indexOf(symbols[i].getComponent(Sprite).spriteFrame)
      );
    }
    return result;
  }

  private setSymbolTexture(node: Node, index: number) {
    node.getComponent(Sprite).spriteFrame = this.textures[index];
  }

  update(dt: number) {
    if (!this._isSpinning) return;

    // Moving symbols
    const moveDistance = this._speed * dt;
    for (let i = 0; i < this._symbols.length; i++) {
      let symbol = this._symbols[i];
      let currentPos = symbol.position;
      symbol.setPosition(
        currentPos.x,
        currentPos.y - moveDistance,
        currentPos.z
      );

      if (symbol.y <= -this._slotStep) {
        let highestY = -9999;
        for (let s of this._symbols) {
          if (s.position.y > highestY) highestY = s.position.y;
        }

        const newY = highestY + this._slotStep;
        symbol.setPosition(0, newY, 0);

        // Stop handling
        if (this._stopSignal) {
          this.handleStopLogic();
          return;
        } else {
          this.setSymbolTexture(
            symbol,
            Math.floor(Math.random() * (this.textures.length - 1))
          );
        }
      }
    }
  }
}
