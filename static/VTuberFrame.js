import  "./facetrack/clmtrackr.min.js";

export default class VTuberFrame extends HTMLElement{
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.innerHTML = `
      <style>
        #display-container {
          display: flex;
          width: 750px;
          height: 400px;
        }
        #video {
          display: none;
        }
        #option {
          background-color: #cccccc;
          height = 100%;
          width = 30px;
          overflow-y: scroll;
        }
      </style>
      <div id="display-container">
        <video id="video"></video>
        <div id="option">背景</div>
      </div>
    `;

    this.WIDTH = 600;
    this.HEIGHT = 400;

    this.container = this.shadowRoot.getElementById("display-container");
    this.video = this.shadowRoot.getElementById("video");
    this.stage = new PIXI.Stage(0x000000);
    this.renderer = PIXI.autoDetectRenderer(this.WIDTH, this.HEIGHT);
    this.canvas = this.renderer.view;
    this.option = this.shadowRoot.getElementById("option");
    this.container.insertBefore(this.canvas, this.option);
    this.callback = null;
    this.self_active = false;
    this.comp_active = false;

    // 顔のテクスチャ
    this.src = null;
    this.texture = null;
    this.face_sprite = null;
    this.points = null;

    // 背景のテクスチャ
    this.bg_src = null;
    this.bg_texture = null;
    this.bg_sprite = null;
    this.bg_src = 'static/img/default.png';

    this.RIGHT = 1;
    this.LEFT  = 13;
    this.CHIN  = 7;
    this.BROW  = 33;
    this.NOUSE = 62;
    this.points_index = [this.RIGHT, this.LEFT, this.CHIN, this.BROW, this.NOUSE];

    this.ctrack = new clm.tracker();
    this.draw_request = null;

    this.plot_face = () => {
      this.face_sprite.position.x = 0;
      this.face_sprite.position.y = 0;
      var n = this.points_index.length;
      for (var i = 0; i < n; i++) {
        var point = this.points[this.points_index[i]];
        this.face_sprite.position.x += point[0]/n;
        this.face_sprite.position.y += point[1]/n;
      }
      if (this.points[this.LEFT] != undefined) {
        var fw = this.distance(this.points[this.LEFT], this.points[this.RIGHT]);
        var fh = this.distance(this.points[this.CHIN], this.points[this.NOUSE])*2;
        var r = this.rotate(this.points[this.LEFT], this.points[this.RIGHT], this.points[this.BROW], this.points[this.CHIN]);
        this.face_sprite.width = fw;
        this.face_sprite.height = fh;
        this.face_sprite.anchor.x = 0.5;
        this.face_sprite.anchor.y = 0.5;
        this.face_sprite.rotation = r;
        this.renderer.render(this.stage);
      }
    }

    this.set_points = (points) => {
      if (this.comp_active) {
        this.points = points;
      } else {
        return;
      }
    }

    this.self_activate = () => {
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

          let self_loop = () => {
            if (this.face_sprite != null){
              this.points = this.ctrack.getCurrentPosition()
              if (this.points){
                this.plot_face();
              }
              if (this.callback != null) {
                this.callback(this.points);
              }
            }
            if (this.self_active) {
              this.draw_request = requestAnimationFrame(self_loop);  
            } else {
              mediaStream.getVideoTracks()[0].stop();
            }
          };
          self_loop()
        }
      });
    }

    this.comp_activate = (points) => {
      let comp_loop = () => {
        if (this.face_sprite != null){
          if (this.points){
            this.plot_face();
          }
        }
        if (this.comp_active){
          this.draw_request = requestAnimationFrame(comp_loop);  
        }
      };
      comp_loop()
    }

    this.set_option = () => {
      // optionの設定
      console.log(this.option);

      var num = 5;
      for (var i = 0; i < num; i++) {
        var image = new Image();
        const filename = 'static/img/background/bg' +('000' + i).slice(-3) + ".jpg"
        image.addEventListener("click", ()=>{
          this.bg_src = filename;
        }); 
        image.src = filename;
        image.height = 100;
        image.width = 150;
        this.option.appendChild(image);
      }
    }

    this.set_option();
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

  set bg_src(s) {
    if (s != null) {
      this._bg_src = s;
      this.bg_texture = PIXI.Texture.fromImage(this._bg_src);
      if (this.bg_sprite == null) {
        this.bg_sprite = new PIXI.Sprite(this.bg_texture);
        this.bg_sprite.height = this.HEIGHT;
        this.bg_sprite.width = this.WIDTH;
        this.stage.addChild(this.bg_sprite);
      } else {
        this.bg_sprite.setTexture(this.bg_texture);
      }
    }
  }

  get bg_src() {
    return this._br_src;
  }

  set self_active(b) {
    this._self_active = b;
    if (b) {
      this.comp_active = false;
      this.self_activate();
    }
  }

  get self_active() {
    return this._self_active;
  }

  set comp_active(b) {
    this._comp_active = b;
    if (b) {
      this.self_active = false;
      this.comp_activate();
    }
  }

  get comp_active() {
    return this._comp_active;
  }



  distance (x, y) {
    return Math.pow(Math.pow(x[0]-y[0], 2) + Math.pow(x[1]-y[1], 2), 0.5);
  }

  rotate (l, r, b, c) {
    return -Math.atan2(r[1]-l[1], -r[0]+l[0]);
  }

}

customElements.define("vtuber-frame", VTuberFrame);
