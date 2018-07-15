import  "./facetrack/clmtrackr.min.js";

var IMG_DIR = "./static/img/";
const FACE_KEY = "FACE";
const BG_KEY = "BG";

const RIGHT = 1;
const LEFT  = 13;
const CHIN  = 7;
const BROW  = 33;
const NOUSE = 62;
const POINT_INDEX = [RIGHT, LEFT, CHIN, BROW, NOUSE];

const WIDTH = 600;
const HEIGHT = 400;

export default class VTuberFrame extends HTMLElement{
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.innerHTML = `
      <style>
        #display-container {
          display: flex;
          width: 600px;
          height: 400px;
          position: relative;
        }

        #option {
          display: none;
          position: absolute;
          height: 400px;
          width: 300px;
          z-index: 2;
          right: 0px;
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
          text-align: center;
        }

        .option-title {
          color: red;
          text-align: center;
          height: 10%;
          font-size: 30px;
        }

        .icon {
          margin: 5px;
        }

        .selected-icon {
          border-style: solid;
          border-width: 2px;
          margin: 3px;
          border-color: rgb(255,0,0);
        }

        canvas {
          position: relative;
          top: 0;
          left: 0;
        }

        #op-btn {
          display: none;
          z-index: 3;
          position: absolute;
          right: 0;
          top: 0;
          background-color: rgb(255,255,255,0.8);
          height: 30px;
          width: 30px;
          font-size: 20px;
          text-align:center;
          font-weight: bold;
          border-style: solid;
        }

        #white-screen {
          display: none;
          z-index: 1;
          position: absolute;
          top: 0;
          left: 0;
          width: 600px;
          height: 400px;
          background-color: rgb(255,255,255,0.5);
        }

        .active {
          transform: translateX(-300px);
        }
      </style>

      <div id="display-container">
        <video id="video"></video>
        <div id="op-btn">x</div>
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
        <div id="white-screen"></div>
      </div>
    `;

    this.container = this.shadowRoot.getElementById("display-container");
    this.video = this.shadowRoot.getElementById("video");
    this.stage = new PIXI.Stage(0x000000);
    this.renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
    this.canvas = this.renderer.view;
    this.option = this.shadowRoot.getElementById("option");
    this.op_btn = this.shadowRoot.getElementById("op-btn");
    this.white_screen = this.shadowRoot.getElementById("white-screen");
    this.op_btn.addEventListener("click", (event) => {
      if (this.option.style.display == "none" || this.option.style.display == "") {
        this.white_screen.style.display = "inline";
        this.option.style.display = "flex";
      } else {
        this.white_screen.style.display = "none";
        this.option.style.display = "none";
      }
    });
    this.container.insertBefore(this.canvas, this.op_btn);

    // 口パク
    this.lipsynch_actve = false;

    this.bg_container = null;
    this.face_container = null; 

    this.bg_textures = [];
    this.face_textures = [];

    this.set_face_texture = (texture) => { 
      if (texture != null) {
        this.texture = texture;
        if (this.face_sprite == null) {
          this.face_sprite = new PIXI.Sprite(this.texture);
          this.face_sprite.height = 1000;
          this.face_sprite.width = 1000;
          if (this.bg_sprite != null) {
            this.stage.addChild(this.face_sprite);
          }
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
          this.bg_sprite.height = HEIGHT;
          this.bg_sprite.width = WIDTH;
          this.stage.addChild(this.bg_sprite);
          if (this.face_sprite != null) {
            this.stage.addChild(this.face_sprite);
          }
        } else {
          this.bg_sprite.setTexture(this.bg_texture);
        }
      }
    }

    this.set_texture = (key, value) => {
      if (key == FACE_KEY) {
        this.set_face_texture(this.face_textures[value][0]);
      } else if (key == BG_KEY) {
        this.set_bg_texture(this.bg_textures[value]);
      }
    }

    this.set_option = () => {
      // optionの設定
      if (this.bg_container == null) {
        this.bg_container = this.shadowRoot.getElementById("bg-container");

        const num = 5;
        for (var i = 0; i < num; i++) {
          const image = new Image();
          const j = i;
          const filename = IMG_DIR + 'background/bg' +('000' + i).slice(-3) + ".jpg"
          image.addEventListener("click", ()=>{
            this.set_bg_texture(this.bg_textures[j]);
            for (var k = 0; k < num; k++) {
              this.bg_container.children[k].classList.remove("selected-icon");
            }
            image.classList.add("selected-icon");
            if (this.option_callback != null) {
              var key = BG_KEY;
              var val = j;
              this.option_callback(key, val);
            }
          }); 
          image.src = filename;
          image.height = 100/15*14;
          image.width = 150/15*14;
          image.classList.add("icon");
          this.bg_container.appendChild(image);
          var texture = PIXI.Texture.fromImage(filename);
          this.bg_textures.push(texture);
        }
      }

      if (this.face_container == null) {
        this.face_container = this.shadowRoot.getElementById("face-container");

        const num = 2;
        for (var i = 0; i < num; i++) {
          const image = new Image();
          const j = i;

          // 口が閉じている顔と開いている顔のセット
          let faces = []

          // 閉じている顔、デフォルト
          let filename = IMG_DIR + 'face/img' +('000' + i).slice(-3) + "0.png"
          image.addEventListener("click", ()=>{
            this.set_face_texture(this.face_textures[j][0]);
            this.face_container.children[this.face_idx].classList.remove("selected-icon");
            image.classList.add("selected-icon");
            if (this.option_callback != null) {
              var key = FACE_KEY;
              this.face_idx = j;
              this.option_callback(key, this.face_idx);
            }
          }); 
          image.src = filename;
          image.height = 130;
          image.width = 130;
          image.classList.add("icon");
          this.face_container.appendChild(image);
          var texture = PIXI.Texture.fromImage(filename);
          faces.push(texture)

          // 開いている顔
          filename = IMG_DIR + 'face/img' + ('000' + i).slice(-3) + "1.png";
          texture = PIXI.Texture.fromImage(filename);
          faces.push(texture)

          this.face_textures.push(faces);
        }
      }
      if (this.self_active) {
        this.op_btn.style.display = "inline";
      }
    }

    this.callback = null;
    this.option_callback = null;

    this.self_active = false;
    this.comp_active = false;

    // 背景のテクスチャ
    this.bg_src = null;
    this.bg_texture = null;
    this.bg_sprite = null;

    // 顔のテクスチャ
    this.texture = null;
    this.face_idx = 0;
    this.src = null;
    this.face_sprite = null;
    this.points = null;

    this.ctrack = new clm.tracker();
    this.draw_request = null;

    this.plot_face = () => {
      var points = this.points;
      this.face_sprite.position.x = WIDTH;
      this.face_sprite.position.y = 0;
      var n = POINT_INDEX.length;
      for (var i = 0; i < n; i++) {
        var point = points[POINT_INDEX[i]];
        this.face_sprite.position.x -= point[0]/n;
        this.face_sprite.position.y += point[1]/n;
      }
      if (points[LEFT] != undefined) {
        var fw = this.distance(points[LEFT], points[RIGHT]);
        var fh = this.distance(points[CHIN], points[NOUSE])*2;
        var r = -this.rotate(points[LEFT], points[RIGHT], points[BROW], points[CHIN]);
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
        this.plot_face();
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
                if (this.callback != null) {
                  this.callback(this.points);
                }
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
    this.set_texture(FACE_KEY, 0);
    this.set_texture(BG_KEY, 0);


    this.lip_mode = 0;
    this.lipsynch = () => {
      let lipsynch_loop = () => {
        this.lip_mode = 1-this.lip_mode;
        if (this.lipsynch_active) {
          this.set_face_texture(this.face_textures[this.face_idx][this.lip_mode]);
          setTimeout(lipsynch_loop, 200);
        } else {
          this.lip_mode = 0;
          this.set_face_texture(this.face_textures[this.face_idx][0]);
        }
      };
      lipsynch_loop();
    }
    this.lipsynch_interval = 3000;

    this.lipsynch_start = (time) => {
      this.lipsynch_interval = time;
      this.lipsynch_active = true;
    }
  }

  set lipsynch_active(active) {
    this._lipsynch_active = active;
    if (active) {
      this.lipsynch(this.lipsynch_interval);
      let lipsynch_deactive = () => { this.lipsynch_active = false; }
      setTimeout(lipsynch_deactive, this.lipsynch_interval);
    } else {
      // 口パクオフ
    }
  }

  get lipsynch_active() {
    return this._lipsynch_active != 0;;
  }

  set option_callback(f) {
    // 引数は(key, value)
    this._option_callback = f;
  }

  get option_callback() {
    return this._option_callback;
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
