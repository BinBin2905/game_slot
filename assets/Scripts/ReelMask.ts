import { AudioController } from "./AudioController";
import {
  _decorator,
  AudioSource,
  Component,
  game,
  instantiate,
  Node,
  Prefab,
  Sprite,
  SpriteFrame,
  Tween,
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
  // private _currentSpeed: number = 0;
  private _maxSpeed: number = 2000;
  private _minSpeed: number = 10;
  // private _accelTimer: number = 0;
  private _resultIndex: number = -1;
  private _symbolHeight: number = 40;
  private _symbolWidth: number = 40;
  private _result: number[] = [];
  private audioController: AudioController = new AudioController();
  private _tweenData = { currentSpeed: 0 };

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
    // this._currentSpeed = 0;
    // this._accelTimer = 0;
    this._state = ReelState.ACCELERATING;
    this.handleStartLogic();
  }

  public stopReel(resultIndex: number) {
    this._resultIndex = resultIndex;
    this._state = ReelState.DECELERATING;
    Tween.stopAllByTarget(this._tweenData);
    // this._accelTimer = 0;

    // tween(this._tweenData)
    //   .to(
    //     1.5,
    //     { currentSpeed: this._minSpeed },
    //     {
    //       easing: "quadOut",
    //       onComplete: () => {
    //         this.handleStopLogic();
    //       },
    //     }
    //   )
    //   .start();

    let targetSymbol = this._symbols[0];
    let maxY = -9999;
    for (let s of this._symbols) {
      if (s.position.y > maxY) {
        maxY = s.position.y;
        targetSymbol = s;
      }
    }

    this.setSymbolTexture(targetSymbol, resultIndex);

    this.executeFinalSnap(targetSymbol);
  }

  private handleStartLogic() {
    if (
      this._state === ReelState.STOPPED ||
      this._state === ReelState.SNAP_TO_GRID
    )
      return;

    this._tweenData.currentSpeed = 0;

    tween(this._tweenData)
      .to(
        this.accelTime,
        { currentSpeed: this._maxSpeed },
        {
          easing: "quadIn",
          onComplete: () => {
            this._state = ReelState.FULL_SPEED;
          },
        }
      )
      .start();
  }

  private handleStopLogic() {
    this._state = ReelState.SNAP_TO_GRID;
    this._symbols.sort((a, b) => a.position.y - b.position.y);

    this.setSymbolTexture(this._symbols[0], this._resultIndex);

    this._symbols.forEach((symbol, index) => {
      const targetY = index * this._slotStep;

      tween(symbol)
        .to(0.4, { position: new Vec3(0, targetY, 0) }, { easing: "backOut" })
        .call(() => {
          if (index === this._symbols.length - 1) {
            this._state = ReelState.STOPPED;
          }
        })
        .start();
    });
    this._result = this.columnResult(this._symbols);
  }

  private executeFinalSnap(targetSymbol: Node) {
    Tween.stopAllByTag(999);
    Tween.stopAllByTarget(this._tweenData);
    this._tweenData.currentSpeed = 0;

    const stopPositionY = 0 * this._slotStep;

    const extraLaps = 1;
    const distanceToPoint = targetSymbol.position.y - stopPositionY;
    const totalDistance =
      distanceToPoint + extraLaps * this._symbols.length * this._slotStep;

    let scrollData = { offset: 0 };
    let lastOffset = 0;

    tween(scrollData)
      .to(
        2.5,
        { offset: totalDistance },
        {
          easing: "quadOut",
          onUpdate: () => {
            let delta = scrollData.offset - lastOffset;
            lastOffset = scrollData.offset;

            this._symbols.forEach((s) => {
              let p = s.position;
              let newY = p.y - delta;

              if (newY <= -this._slotStep) {
                let highestY = Math.max(
                  ...this._symbols.map((sym) => sym.position.y)
                );
                newY = highestY + this._slotStep;
              }
              s.setPosition(p.x, newY, p.z);
            });
          },
          onComplete: () => {
            this.snapAllToGrid(targetSymbol, stopPositionY);
            this._state = ReelState.STOPPED;
          },
        }
      )
      .start();
  }

  private snapAllToGrid(targetSymbol: Node, targetY: number) {
    // Tính toán lại vị trí chuẩn xác nhất dựa trên thằng Banana
    const diff = targetSymbol.position.y - targetY;
    this._symbols.forEach((s) => {
      s.setPosition(0, s.position.y - diff, 0);
    });
  }
  private moveSymbols() {
    const dt = game.deltaTime;
    const moveDistance = this._tweenData.currentSpeed * dt;
    for (let i = 0; i < this._symbols.length; i++) {
      let symbol = this._symbols[i];
      let currentPos = symbol.position;
      symbol.setPosition(
        currentPos.x,
        currentPos.y - moveDistance,
        currentPos.z
      );

      if (symbol.y <= -this._slotStep) {
        let highestY = Math.max(...this._symbols.map((s) => s.position.y));
        symbol.setPosition(0, highestY + this._slotStep, 0);

        if (this._state !== ReelState.DECELERATING) {
          this.setSymbolTexture(
            symbol,
            Math.floor(Math.random() * (this.textures.length - 1))
          );
        }
      }
    }
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

    this.moveSymbols();
  }
}
