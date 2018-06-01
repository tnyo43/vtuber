import Recognizer from "./Recognizer.js";

export default class SpeakerTag extends HTMLElement{
  constructor() {

    super();

    this.attachShadow({mode: "open"}); // mode:open -> javascriptからだけ操作可能
                                       // mode:close -> jsからも操作できない
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

    this.canvas = this.shadowRoot.getElementById("recording");
    this.context = this.canvas.getContext("2d");
    this.canvas.width = 40;
    this.canvas.height = 40;

    this.show_stop_recording();
    this.set_keydown();
  }

  set_keydown() {
    console.log(document);
    document.addEventListener('keydown', (event) => {
        const keyName = event.key;
        if (keyName === " ") {
          this.recognizer.start();
          this.show_recording();
          this.recognizer.flag_speech = true;
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
