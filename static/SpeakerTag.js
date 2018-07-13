import Recognizer from "./Recognizer.js";
// import Speaker from "./Speaker.js";

export default class SpeakerTag extends HTMLElement{
  constructor() {

    super();

    this.attachShadow({mode: "open"}); 
    this.shadowRoot.innerHTML = `
        <style>
          .canv {
            height: 100px;
            width: 100px;
          }

          #container {
            background-color: gray;
            height: 100px;
            width: 200px;
            display: flex;
          }

          #icon-div {
            flex-grow: 1;
            flex-basis: 50%;
          }

          #slider-div {
            flex-grow: 2;
            flex-basis: 30%;
            width: 300px;
          }

          input {
            width: 120px;
          }

          #voice {
            width: 120px;
          }
        </style>
        <div id="container" class="speaker-tag-container">
          <div id="icon-div">
            <canvas class="canv" id="recording"></canvas>
          </div>
          <div id="slider-div" class="speaker-tag-sliders">
            <input class="speaker-tag-slider" type="range" id="rate"  min='0.0' max='2.0', step='0.1'>
            <input class="speaker-tag-slider" type="range" id="pitch" min='0.0' max='2.0', step='0.1'>
            <select id="voice">
              <option value="0">男</option>
              <option value="1">女</option>
              <option value="2">子供</option>
            </select>
          </div>
        </div>
      `;

    this.recognizer = new Recognizer();
    this.callback = null;

    this.canvas = this.shadowRoot.getElementById("recording");
    this.context = this.canvas.getContext("2d");
    this.canvas.width = 40;
    this.canvas.height = 40;

    this.show_stop_recording();
    this.set_keydown();
    this.recognizer_active = false;

    this.voice_select = this.shadowRoot.getElementById("voice");
    this.pitch_range = this.shadowRoot.getElementById("pitch");
    this.rate_range = this.shadowRoot.getElementById("rate");
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

  set callback (f) {
    this._callback = f;
    this.recognizer.callback = (text) => {
      this.text = text;
      let v = this.voice_select.value;
      let p = this.pitch_range.value;
      let r = this.rate_range.value;
      console.log(this.text, v, p, r);
    };
  }

  get callback () {
    return this._callback;
  }

  set text(text) {
    //TODO set voice pitch, rate to callback
    this.callback(text, 1,1,1);
  }

  get text() {
    return "";
  }

  set_keydown() {
    document.addEventListener('keydown', (event) => {
        const keyName = event.key;
        if (keyName === " ") {
          if (this.recognizer_active && !this.recognizer.is_recognizing) {
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
