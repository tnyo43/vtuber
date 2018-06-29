import  "./facetrack/clmtrackr.min.js";

var IMG_DIR = "./static/img/";

export default class VTuberFrame extends HTMLElement{
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.innerHTML = `
      <style>
        #display-container {
          display: flex;
          width: 900px;
          height: 400px;
        }
        #option {
          display: flex;
        }

        #video {
          display: none;
        }

        #bg-container, #face-container {
          overflow-y: scroll;
          max-height: 90%;
        }

        #option-bg, #option-face {
          background-color: #cccccc;
          height = 100%;
          overflow-y: hidden;
          flex-grow: 1;
          flex-basis: 100%;
        }

        .option-title {
          color: red;
          text-align: center;
          height: 10%;
          font-size: 30px;
        }

        .icon {

        }

        #canvas-div {
          position: relative;
        }

        canvas {
          position: relative;
          top: 0;
          left: 0;
        }

        .op-btn {
          z-index: 2;
          position: absolute;
          right: 0;
          top: 0;
          color: red;
        }
      </style>

      <div id="display-container">
        <video id="video"></video>
        <div id="canvas-div">
          <div class="op-btn">x</div>
        </div>
        <div id="option">
          <div id="option-bg">
            <div class="option-title">背景</div>
            <div id="bg-container"></div>
          </div>
          <div id="option-face">
            <div class="option-title">顔</div>
            <div id="face-container"></div>
          </div>
        </div>
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
    this.op_btn = this.shadowRoot.getElementById("op-btn");
    this.shadowRoot.getElementById("canvas-div").insertBefore(this.canvas, this.op_btn);


    this.bg_container = null;
    this.face_container = null; 

    this.bg_textures = [];
    this.bg_index = 0;
    this.face_textures = [];
    this.face_index = 0;

    this.set_face_texture = (texture) => { 
      if (texture != null) {
        this.texture = texture;
        if (this.face_sprite == null) {
          this.face_sprite = new PIXI.Sprite(this.texture);
          this.face_sprite.height = 1000;
          this.face_sprite.width = 1000;
          this.stage.addChild(this.face_sprite);
        } else {
          this.face_sprite.setTexture(this.texture);
        }
      }
    }

    this.set_bg_texture = (texture) => {
      if (texture != null) {
        this.bg_texture = texture;
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

    this.set_option = () => {
      // optionの設定
      if (this.bg_container == null) {
        this.bg_container = this.shadowRoot.getElementById("bg-container");

        var num = 5;
        for (var i = 0; i < num; i++) {
          var image = new Image();
          const j = i;
          const filename = IMG_DIR + 'background/bg' +('000' + i).slice(-3) + ".jpg"
          image.addEventListener("click", ()=>{
            this.set_bg_texture(this.bg_textures[j]);
          }); 
          image.src = filename;
          image.height = 100;
          image.width = 150;
          this.bg_container.appendChild(image);
          var texture = PIXI.Texture.fromImage(filename);
          this.bg_textures.push(texture);
        }
      }

      if (this.face_container == null) {
        this.face_container = this.shadowRoot.getElementById("face-container");

        var num = 4;
        for (var i = 0; i < num; i++) {
          var image = new Image();
          const j = i;
          const filename = IMG_DIR + 'face/face' +('000' + i).slice(-3) + ".png"
          image.addEventListener("click", ()=>{
            this.set_face_texture(this.face_textures[j]);
          }); 
          image.src = filename;
          image.height = 130;
          image.width = 130;
          this.face_container.appendChild(image);
          var texture = PIXI.Texture.fromImage(filename);
          this.face_textures.push(texture);
        }
      }
      if (this.self_active){
        this.option.style.display = "flex";
      } else {
        this.option.style.display = "none";
      }
    }

    this.callback = null;
    this.self_active = false;
    this.comp_active = false;

    // 背景のテクスチャ
    this.bg_src = null;
    this.bg_texture = null;
    this.bg_sprite = null;
  
    // 顔のテクスチャ
    this.texture = null;
    this.src = null;
    this.face_sprite = null;
    this.points = null;


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
      comp_loop();
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
    if (s != null) {
      this._src = s;
      this.set_face_texture(PIXI.Texture.fromImage(s));
    }
  }

  get src() {
    return this._src;
  }

  set bg_src(s) {
    if (s != null) {
      this._bg_src = s;
      this.set_bg_texture(PIXI.Texture.fromImage(s));
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
      this.set_option();
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
