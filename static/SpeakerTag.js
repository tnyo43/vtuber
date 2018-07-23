import Recognizer from "./Recognizer.js";
// import Speaker from "./Speaker.js";

export default class SpeakerTag extends HTMLElement{
  constructor() {

    super();

    this.attachShadow({mode: "open"}); 
    this.shadowRoot.innerHTML = 
    `
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
            position: relative;
            left:440px;
            top:35px; 
          }

          #slider-div {
            flex-grow: 2;
            flex-basis: 30%;
            width: 300px;
            position: relative;
            top: 20px;
            right:280px;
          }

          select{
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
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
            border-color: #FF5959 ;
          }

          option{
            background-color: #333333;
          }

          #select{
            position:relative;
            top: -130px;
            right:50px;
            display: inline-block;
            height:30px;
            z-index: 1;
          }

          #record-btn {
            background-color: white;
            border: none;
            color: #FF5959;
            height: 40px;
            width:150px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 30px;
            margin: 10px 0 0 0;
            -webkit-transition-duration: 0.4s; /* Safari */
            transition-duration: 0.4s;
            cursor: pointer;
            border-radius:2px;
            font-family: Bahnschrift;
          }

          input[type=range]{
            margin-top: 8px;
            outline: none;
            -webkit-appearance: none;    
            background: -webkit-linear-gradient(#FF5959, #FF5959) no-repeat, #ddd;
            height: 3px;
            position: relative;
            top: -65px;
            left:50px;
          }

          input[type=range]::-webkit-slider-thumb {
              -webkit-appearance: none;
              height:16px;
              width: 16px;
              background: #fff;
              border-radius: 50%;
              border: solid 1px #ddd;
          }

          .rate_p{
            color: white;
            width:180px;
            padding-left: 5px;
            border:1px solid #757575;
            border-radius:2px;
            position: relative;
            top: -20px;
          }

          .pitch_p{
            color: white;
            width:180px;
            padding-left: 5px;
            border:1px solid #757575;
            border-radius:2px;
            position: relative;
            top:-60px;
          }

          #pitch{
            position: relative;
            top:-105px;
          }

          .hide{
            display: none;
          }

          .show {
            display: inline;
          }

        </style>
        <div id="container" class="speaker-tag-container">
          <div id="icon-div">
            <canvas class="canv" id="recording"></canvas>
            <input type="button" id="record-btn" value="record"></input>
          </div>
          <div id="hide_set">
            <div id="slider-div">
              <p class="rate_p">速さ: </p><input type="range" id="rate"  min='0.0' max='2.0', step='0.1'>
              <p class="pitch_p">高さ: </p><input type="range" id="pitch" min='0.0' max='2.0', step='0.1'>
            </div>
            <div id="select">
              <select id="voice">
                <option value="0">男</option>
                <option value="1">女</option>
                <option value="2">子供</option>
              </select>
            </div>
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

    this.record_btn = this.shadowRoot.getElementById("record-btn");

    this.hide_set=this.shadowRoot.getElementById("hide_set");

    this.rate_range = this.shadowRoot.getElementById("rate");
    this.pitch_range = this.shadowRoot.getElementById("pitch");


    this.record_btn.onclick = () => {
      if (this.recognizer_active){
        if (!this.recognizer.is_recognizing) {
          this.recognizer.start();
          this.show_recording();
          this.recognizer.flag_speech = true;
          this.record_btn.value = "stop";
          this.record_btn.style.backgroundColor='#FF5959';
          this.record_btn.style.color='white';
        } else {
          this.recognizer.stop();
          this.show_stop_recording();
          this.recognizer.flag_speech = false;
          this.record_btn.value = "record";
          this.record_btn.style.backgroundColor='white';
          this.record_btn.style.color='#FF5959';
        }
      }
    }


    this.show_setting = (b) => {
      if (b) {
        this.hide_set.classList.add("show");
        this.hide_set.classList.remove("hide");
      } else {
        this.hide_set.classList.remove("show");
        this.hide_set.classList.add("hide");
      }
    }

    this.show_setting(false);

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

