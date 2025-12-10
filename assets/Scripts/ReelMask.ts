import { AudioController } from "./AudioController";
import {
  _decorator,
  AudioSource,
  Component,
  instantiate,
  math,
  Node,
  Prefab,
  Sprite,
  SpriteFrame,
  tween,
  UITransform,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

enum ReelState {
  STOPPED,
  ACCELERATING,
  FULL_SPEED,
  DECELERATING,
  SNAP_TO_GRID,
}

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
  @property({ tooltip: "Thời gian để đạt tốc độ tối đa (giây)" })
  accelTime: number = 1;
  @property({ tooltip: "Symbols count" })
  symbolsCount: number = 10;

  private _symbols: Node[] = [];

  private _state: ReelState = ReelState.STOPPED;
  private _currentSpeed: number = 0;
  private _maxSpeed: number = 2000;
  private _minSpeed: number = 200;
  private _accelTimer: number = 0;
  private _resultIndex: number = -1;
  private _symbolHeight: number = 40;
  private _symbolWidth: number = 40;
  private _result: number[] = [];
  private audioController: AudioController = new AudioController();

  private get _slotStep(): number {
    return this._symbolHeight + this.gap;
  }

  onLoad() {
    this.initReel();
  }

  initReel() {
    this._symbols = [];
    this.symbolsNode.removeAllChildren();

    for (let i = 0; i < this.symbolsCount; i++) {
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
    let sound = this.getComponent(AudioSource);
    this.audioController.init(sound);
  }

  public startSpin() {
    this.audioController.play();
    if (this._state !== ReelState.STOPPED) return;
    this._currentSpeed = 0;
    this._accelTimer = 0;
    this._state = ReelState.ACCELERATING;
  }

  public stopReel(resultIndex: number) {
    this._resultIndex = resultIndex;
    this._state = ReelState.DECELERATING;
    this._accelTimer = 0;
  }

  private handleStopLogic() {
    this._state = ReelState.SNAP_TO_GRID;
    console.log("resultIndex: " + this._resultIndex);
    this._symbols.sort((a, b) => a.position.y - b.position.y);

    this.setSymbolTexture(this._symbols[0], this._resultIndex);
    this._symbols.forEach((symbol, index) => {
      const targetY = index * this._slotStep;
      // const stopIndex = this.rng.randomInt(0, 3);
      // if (index === stopIndex % this._symbols.length) {
      //   symbol.getComponent(Sprite).spriteFrame =
      //     this.textures[this._resultIndex];
      // }
      tween(symbol)
        .to(0.3, { position: new Vec3(0, targetY, 0) }, { easing: "backOut" })
        .call(() => {
          if (index === this._symbols.length - 1) {
            this._state = ReelState.STOPPED;
          }
        })
        .start();
    });
    this._result = this.columnResult(this._symbols);
    console.log("DONE STOP");
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
    if (
      this._state === ReelState.STOPPED ||
      this._state === ReelState.SNAP_TO_GRID
    )
      return;

    if (this._state === ReelState.ACCELERATING) {
      this._accelTimer += dt;

      let progress = this._accelTimer / this.accelTime;
      if (progress > 1) progress = 1;

      this._currentSpeed = math.lerp(0, this._maxSpeed, progress * progress);

      if (progress >= 1) {
        this._state = ReelState.FULL_SPEED;
      }
    } else if (this._state === ReelState.DECELERATING) {
      this._accelTimer += dt;
      let progress = this._accelTimer / (this.accelTime + 1);
      if (progress > 1) progress = 1;

      this._currentSpeed = math.lerp(this._maxSpeed, this._minSpeed, progress);

      if (progress >= 1) {
        this.handleStopLogic();
        return;
      }
    }

    const moveDistance = this._currentSpeed * dt;
    // const stretchFactor = (this._currentSpeed / this._maxSpeed) * 0.5;

    for (let i = 0; i < this._symbols.length; i++) {
      let symbol = this._symbols[i];
      // symbol.setScale(1 - stretchFactor * 0.5, 1 + stretchFactor, 1);
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
        if (
          this._state !== ReelState.DECELERATING &&
          this._state !== ReelState.FULL_SPEED
        ) {
          this.setSymbolTexture(
            symbol,
            Math.floor(Math.random() * (this.textures.length - 1))
          );
        }
      }
    }
  }
}
