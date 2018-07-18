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
            display: none;
          }

          #container {
            background-color: #333333;
            height: 100px;
            width: 600px;
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
            position: relative;
            top: 10px;
            right: 50px;
          }

          select{
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            padding: 0;
            margin: 0;
            height: 30px;
            width: 100px;
            background: transparent;
            position: relative;
            z-index: 1;
            padding: 0 40px 0 10px;
            border: 1px solid white;
            color: white;
            outline: none;
          }

          select::-ms-expand {
              display: none;
          }

          select:hover{
            border: 1px solid #FF5959;
          }

          option{
            background-color: #333333;
          }

          #selectW{
              position: relative;
              left:-50px;
              top: 22px;
              display: inline-block;
              height:30px;

          }

          #selectW::before{
            content: '';
            position: absolute;
            z-index: 0;
            top: 0;
            right: 0;
            background: #ccc;
            height: 100%;
            width: 30px;
          }

          #selectW::after{
            content: '';
            position: absolute;
            z-index: 0;
            top: 0;
            bottom: 0;
            margin: auto 0;
            right: 9px;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 6px 6px 0 6px;
            border-color: #FF5959 transparent transparent transparent;
          }

          #record-btn {
            background-color: #FF5959;
            border: none;
            color: white;
            padding: 3px 15px 3px 15px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 22px;
            margin: 10px 0 0 0;
            -webkit-transition-duration: 0.4s; /* Safari */
            transition-duration: 0.4s;
            cursor: pointer;
            border-radius:2px;
            font-family: Bahnschrift;
            position: relative;
            top: 10px;
            left:60px;
          }

          input[type=range]{
            margin-top: 8px;
            outline: none;
            -webkit-appearance: none;
            width:56% !important;
            background: -webkit-linear-gradient(#61bd12, #61bd12) no-repeat, #ddd;
            height: 3px;
          }

          input[type=range]::-webkit-slider-thumb {
              -webkit-appearance: none;
              height:16px;
              width: 16px;
              background: #fff;
              border-radius: 50%;
              border: solid 1px #ddd;
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
    // this.set_keydown();
    this.recognizer_active = false;

    this.voice_select = this.shadowRoot.getElementById("voice");
    this.pitch_range = this.shadowRoot.getElementById("pitch");
    this.record_btn = this.shadowRoot.getElementById("record-btn");

    this.output= this.shadowRoot.getElementById("demo");
    this.rate_range = this.shadowRoot.getElementById("rate");

    this.output.innerHTML = this.rate_range.value;
    this.rate_range.oninput = () => {
        this.output.innerHTML = this.rate_range.value;
    }

    this.record_btn.onclick = () => {
        if (this.recognizer_active){
            if (!this.recognizer.is_recognizing) {
                this.recognizer.start();
                this.show_recording();
                this.recognizer.flag_speech = true;
                this.record_btn.value = "stop";
                this.record_btn.style.backgroundColor='white';
                this.record_btn.style.color='#FF5959';
            } else {
                this.recognizer.stop();
                this.show_stop_recording();
                this.recognizer.flag_speech = false;
                this.record_btn.value = "record";
                this.record_btn.style.backgroundColor='#FF5959';
                this.record_btn.style.color='white';
            }
        }

    }


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

  /*
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
  */

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

