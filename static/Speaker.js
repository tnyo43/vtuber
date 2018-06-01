export default class {
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
