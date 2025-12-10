import { _decorator, AudioClip, AudioSource, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AudioController")
export class AudioController extends Component {
  @property(AudioSource)
  public _audioSource: AudioSource = null!;

  //   onLoad() {
  //     const audioSource = this.node.getComponent(AudioSource)!;

  //     this._audioSource = audioSource;
  //   }

  init(audio: AudioSource) {
    this._audioSource = audio;
  }

  play() {
    // Play the music
    this._audioSource.play();
  }

  pause() {
    // Pause the music
    this._audioSource.pause();
  }
}
