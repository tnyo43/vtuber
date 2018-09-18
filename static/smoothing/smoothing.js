import FFT from "./fft.js";

export default class {
  constructor(N) {
    this.N = N;
    this.ffts = [];
    this.latest_fft = new FFT(this.N);
    this.ffts.push(this.latest_fft);
    this.fft_index = 0;
    this.pass = this.N;
    this.index = 0;
  }

  sections() {
    return this.ffts.length;
  }

  put(point) {
    this.latest_fft.put(this.fft_index++, point)
    if (this.fft_index == this.N) {
      this.latest_fft.fft();
      let new_fft = new FFT(this.N);
      new_fft.low_pass(this.pass);

      for (var i = 0; i < this.N/4|0; i++) 
        new_fft.put(i, this.latest_fft.points[this.N-this.N/4|0+i]);
      this.latest_fft = new_fft;
      this.fft_index = this.N/4|0;
      this.ffts.push(this.latest_fft);
    }
  }

  low_pass(n) {
    this.pass = n;
    for (var i = 0; i < this.ffts.length; i++) {
      this.ffts[i].low_pass(n)
    }
  }

  is_ready() {
    if (this.index >= this.N && (this.ffts.length <= 1 || this.ffts[1].spectrum == null)) return false;
    return this.ffts.length >= 1 && this.ffts[0].spectrum != null;
  }

  get() {
    if (this.ffts[0].spectrum == null) return null;
    if (this.index >= this.N) {
      this.index = this.N/4|0;
      this.ffts.shift();
    } else if (this.ffts.length >= 2 && this.ffts[1].spectrum != null  && this.index >= this.N-this.N/4|0) {
      let w = this.N/4|0;
      let index = this.index - (this.N-w);
      let x = this.ffts[0].ifft(this.index/this.N);
      let y = this.ffts[1].ifft(index/this.N);
      this.index++;
      return (x*(w-index)+y*index)/w;
    }
    return this.ffts[0].ifft((this.index++)/this.N);
  }
}

