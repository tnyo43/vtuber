import  "./facetrack/clmtrackr.min.js";

export default class VTuberFrame extends HTMLElement{
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.innerHTML = `
      <style>
        #display-container {
        }
        #video {
          display: none;
        }
      </style>
      <div id="display-container">
        <video id="video"></video>
      </div>
    `;

    this.WIDTH = 600;
    this.HEIGHT = 400;

    this.container = this.shadowRoot.getElementById("display-container");
    this.video = this.shadowRoot.getElementById("video");
    this.stage = new PIXI.Stage(0x000000);
    this.renderer = PIXI.autoDetectRenderer(this.WIDTH, this.HEIGHT);
    this.canvas = this.renderer.view;
    this.container.appendChild(this.canvas);
    this.callback = null;

    this.src = null;
    this.texture = null;
    this.face_sprite = null;

    this.RIGHT = 1;
    this.LEFT  = 13;
    this.CHIN  = 7;
    this.BROW  = 33;
    this.NOUSE = 62;
    this.points_index = [this.RIGHT, this.LEFT, this.CHIN, this.BROW, this.NOUSE];

    this.ctrack = new clm.tracker();
    this.draw_request = null;

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then((mediaStream) => {
      this.video.srcObject = mediaStream;
      this.video.play();
      this.video.onloadedmetadata = () => {
        this.video.width = this.renderer.view.width;
        this.video.height = this.renderer.view.height;
        this.ctrack.init(pModel);
        this.ctrack.start(this.video);
 
        let loop = () => {
          if (this.face_sprite != null){
            var points = this.ctrack.getCurrentPosition()
            if (points){
              var time = Math.random()
              this.face_sprite.position.x = 0;
              this.face_sprite.position.y = 0;
              var n = this.points_index.length;
              for (var i = 0; i < n; i++) {
                var point = points[this.points_index[i]];
                this.face_sprite.position.x += point[0]/n;
                this.face_sprite.position.y += point[1]/n;
              }
              if (points[this.LEFT] != undefined) {
              var fw = this.distance(points[this.LEFT], points[this.RIGHT]);
              var fh = this.distance(points[this.CHIN], points[this.NOUSE])*2;
              var r = this.rotate(points[this.LEFT], points[this.RIGHT], points[this.BROW], points[this.CHIN]);
              this.face_sprite.width = fw;
              this.face_sprite.height = fh;
              this.face_sprite.anchor.x = 0.5;
              this.face_sprite.anchor.y = 0.5;
              this.face_sprite.rotation = r;
              this.renderer.render(this.stage);
              }
            }

            if (this.callback != null) {
              this.callback(points);
            }
            else {
              console.log("this.callback is null")
            }
          }
          this.draw_request = requestAnimationFrame(loop);  
        };
        loop()
      }
    });
  }

  set callback(f) {
    this._callback = f;
  }

  get callback() {
    return this._callback;
  }

  set src(s) {
    if (s != null){
      this._src = s;
      this.texture = PIXI.Texture.fromImage(this._src);
      this.face_sprite = new PIXI.Sprite(this.texture);
      this.face_sprite.height = 1000;
      this.face_sprite.width = 1000;
      this.stage.addChild(this.face_sprite);
    }
  }

  get src() {
    return this._src;
  }

  distance (x, y) {
    return Math.pow(Math.pow(x[0]-y[0], 2) + Math.pow(x[1]-y[1], 2), 0.5);
  }

  rotate (l, r, b, c) {
    return -Math.atan2(r[1]-l[1], -r[0]+l[0]);
  }

}

customElements.define("vtuber-frame", VTuberFrame);
