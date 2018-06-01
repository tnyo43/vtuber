// Recognizerクラス
// startメソッドで認識を開始する
// stopメソッドが呼び出されるまで認識を続ける
// set_event_functionsで、認識開始時、認識終了時に実行するメソッドを設定できる。

class Recognizer {
  constructor() {
    this.speaker = null;
    this.recognition = null;
    this.start_function = null;
    this.stop_function = null;

    this.flag_speech = false;
    this.flag_result = false;
  }

  set_speaker(speaker) {
    this.speaker = speaker;
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
        $("#result").append("<li>"+value+"</li>");
        if (this.speaker != null) {
          this.speaker.speak(value);
        } else {
          this.speaker = new Speaker()
          this.speaker.speak(value);
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

class Speaker {
  constructor() {
    this.ss = new SpeechSynthesisUtterance();
    this.ss.lang = "ja-JP";
    this.ss.voiceURI = "Google 日本人";
    this.ss.volume = 1;
    this.ss.rate = 1;
  }

  speak(text) {
    this.ss.text = text;
    speechSynthesis.speak(this.ss);
  }
}

