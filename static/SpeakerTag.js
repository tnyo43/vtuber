import Recognizer from "./Recognizer.js";
import Speaker from "./Speaker.js";

export default class SpeakerTag extends HTMLElement{
  constructor() {

    super();

    this.attachShadow({mode: "open"}); 
    this.shadowRoot.innerHTML = `
        <style>
          .canv {
            height: 20px;
            width: 20px;
          }
        </style>
        <canvas class="canv" id="recording"/>
      `;

    this.recognizer = new Recognizer();
    this.recognizer.set_speaker(null);
    this.comp_speaker = new Speaker();

    this.canvas = this.shadowRoot.getElementById("recording");
    this.context = this.canvas.getContext("2d");
    this.canvas.width = 40;
    this.canvas.height = 40;

    this.show_stop_recording();
    this.set_keydown();
    this.recognizer_active = false;
    this.comp_active = false;

    this.comp_speak = (text) => {
      if (this.comp_active == false) {
        return;
      } else {
        this.comp_speaker.speak(text);
      }
    }

    this.callback = null;
  }

  set recognizer_active (b) {
    this._recognizer_active = b;
    if (!b) {
      this.recognizer.stop();
      this.show_stop_recording();
      this.recognizer.flag_speech = false;
    }
  }

  get recognizer_active () {
    return this._recognizer_active;
  }

  set comp_active (b) {
    this._comp_active = b;
  }

  get comp_active () {
    return this._comp_active;
  }

  set callback (f) {
    this._callback = f;
    this.recognizer.callback = this._callback;
  }

  get callback () {
    return this._callback;
  }

  set_keydown() {
    document.addEventListener('keydown', (event) => {
        const keyName = event.key;
        if (keyName === " ") {
          if (this.recognizer_active) {
            this.recognizer.start();
            this.show_recording();
            this.recognizer.flag_speech = true;
          }
        }
        else if (keyName == "q") {
          this.recognizer.stop();
          this.show_stop_recording();
          this.recognizer.flag_speech = false;
        }
      }, true);
  }

  double_ring(color) {
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(20, 20, 20, 0, 2 * Math.PI, false);
    this.context.fill();
    this.context.fillStyle = 'rgb(255, 255, 255)';
    this.context.beginPath();
    this.context.arc(20, 20, 18, 0, 2 * Math.PI, false);
    this.context.fill();
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(20, 20, 15, 0, 2 * Math.PI, false);
    this.context.fill();
  }

  show_recording() {
    this.double_ring('rgb(255, 0, 0)');
  }

  show_stop_recording() {
    this.double_ring('rgb(0, 0, 0)');
  }
}

customElements.define("speaker-tag", SpeakerTag);
