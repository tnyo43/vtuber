import Speaker from './Speaker.js';

export default class {
  constructor() {
    this.speaker = null;
    this.recognition = null;
    this.start_function = null;
    this.stop_function = null;

    this.flag_speech = false;
    this.flag_result = false;

    this.callback = null;
  }

  set callback (f) {
    this._callback = f;
  }

  get callback () {
    return this._callback;
  }

  set_speaker(speaker) {
    if (speaker != null) {
      this.speaker = speaker;
    } else {
      this.speaker = new Speaker();
    }
  }

  set_event_functions(start, stop) {
    this.start_function = start;
    this.stop_function = stop;
  }

  start(){
    this.recognition = new webkitSpeechRecognition();
    this.recognition.lang = "ja-JP";
    this.recognition.start();
    if (this.start_function != null) {
      this.start_function();
    }
    this.recognition.onend = () => {
      console.log("on end");
      this.stop();
      if (!this.flag_result && this.flag_speech) {
        this.start();
      }
      this.flag_result = false;
    }
    this.recognition.error = () => {
      console.log("error");
      if (this.flag_speech) {
        this.start();
      }
    }
    this.recognition.onnomatch = () => {
      console.log("no match");
      if (this.flag_speech) {
        this.start();
      }
    }
    this.recognition.onresult = (e) => {
      console.log("result")
      if(e.results.length > 0){
        var value = e.results[0][0].transcript;
        console.log("result is \"" + value + "\"")
        if (this.speaker != null) {
          this.speaker.speak(value);
          this.callback(value);
        }
      }
    }
  }

  stop(){
    if (this.stop_function != null) {
      this.stop_function();
    }
    if (this.recognition != null){
      this.recognition.stop();
    }
  }  
}
