import { _decorator, Component, Node, tween, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ReelMask")
export class ReelMask extends Component {
  //   start() {}
  @property({ type: Node })
  public content: Node | null = null;

  @property
  symbolSpacing: number = 100; // khoảng cách giữa các sprite

  @property
  symbolCount: number = 5; // số sprite trong content

  spin(stopIndex: number, loops: number = 2, duration: number = 2) {
    const fullDistance = this.symbolCount * this.symbolSpacing;
    const totalDistance = fullDistance * loops + stopIndex * this.symbolSpacing;
    // reset vị trí bắt đầu
    this.content.setPosition(new Vec3(0, 0, 0));

    tween(this.content)
      .by(
        duration,
        { position: new Vec3(0, -totalDistance, 0) },
        { easing: "cubicOut" }
      )
      .call(() => {
        // dừng và đặt lại vị trí nội bộ nếu cần
        const mod = totalDistance % fullDistance;
        this.content.setPosition(new Vec3(0, -mod, 0));
        console.log("Reel dừng tại index:", stopIndex);
        // emit event hoặc gọi callback dừng
      })
      .start();
  }
  //   update(deltaTime: number) {}
}
