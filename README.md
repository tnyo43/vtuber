# vtuber

COJTソフトウェアコースのプロジェクト：vtuberチャットのモジュール
カメラで顔を認識して画面に表示する「VtuberFrame」
音声を認識して文字にする、また再生する「SpeakerTag」

## Description

### VtuberFrame
カメラで撮影した映像から、clmtrackrで顔の情報を取得する。    
取得した情報からcanvasに顔の画像を貼り付ける。    
    
顔の情報を取得するたびに呼び出されるコールバック関数、外部から顔の情報を与える関数を持つ。　　　　


### SpeakerTag
音声を認識し読み上げるモジュール。    
webkitSpeechRecognitionで音声をテキストに変換する。 　　　
変換した文字はSpeechSynthesisUtteranceで読み上げられる。

## Usage

### VtuberFrame
VTuberFrame.jsファイルを開き、
```
var IMG_DIR = "./static/img/";
```
を、自分が画像を保存しているフォルダのパスに書き換える。最後の"/"を忘れないようにする。
```
var IMG_DIR = "./YOUR_IMAGE_PATH/";
```
また、画像ファイルは背景を「./YOUR_IMAGE_PATH/background/bg000.jpg」、
顔を「./YOUR_IMAGE_PATH/face/face000.png」の形式で保存する。
数字は000から3桁で連番にする。

htmlファイルで
```
<script type="module" src="/static/VTuberFrame.js"></script>
<script src="/static/facetrack/model_pca_20_svm.js"></script>
<script src="/static/facetrack/clmtrackr.min.js"></script>
<script src="/static/facetrack/pixi.min.js"></script>
```
を呼び出し、bodyで、
```
<video id="video"></video> <!-- 撮影をするために必要 -->
<vtuber-frame id="vtubertag1"></vtuber-frame>
<vtuber-frame id="vtubertag2"></vtuber-frame>
<script type="module">
  import VTuberFrame from './static/VTuberFrame.js'

  /// 自分の顔を写すウィンドウとしてvtag1を使う
  let vtag1 = document.getElementById('vtubertag1');
  vtag1.self_active = true;
  
  
  /// 相手側の顔を写すウィンドウとしてvtag2を使う
  let vtag2 = document.getElementById('vtubertag2');
  vtag2.comp_active = true;↲
  
  
  /// もしコールバック関数を設定したいなら
  /// 変数xは顔の情報を持つ71点の配列
  /// ウェブソケットで点の情報を送るときもこれをつかう
  /*
  let callback = (points) => {
      console.log(points);
      WEBSOCKET_SEND_MESSAGE(points)
  }
  vtag1.callback = callback;
  */
  
  /// ウェブソケットで話し相手の点情報を受け取り、相手側のウィンドウで表示したいとき
  /// vtag2.set_points(points)を使う
  /*
  WEBSOCKET_GET_MESSAGE(points) {
    vtag2.set_points(points);
  }
  */
  
  ///　背景や顔のスキンを変更した時に使うコールバック
  /// 画面横のオプションで更新するたびに呼び出される。
  /*
  vtag1.option_callback = (key, value) => {↲
    console.log(key, value);
    WEBSOCKET_SEND_MESSAGE(key, value);
  }↲
  */
  
  /// 相手の背景や顔のスキンが変更した時に使うコールバック
  /*
  WEBSOCKET_GET_MESSAGE(key, value) {
    vtag2.set_texture(key, value);
  }
  */
</script>
```
とすると使える

### SpeakerTag

htmlファイルで
```
<script type="module" src="/static/SpeakerTag.js"></script>
```
を呼び出し、bodyで、
```
<speaker-tag id="speakertag"></speaker-tag>

<script type="module">

  let stag = document.getElementById("speakertag");
  
  /// もしコールバック関数を設定したいなら
  /// 変数xは認識した文字列
  let callback = (x) => {
    console.log(x);
  }
  stag.callback = callback;

　　　　/// SpeakerTagを起動する。
  stag.recognizer_active = true;
 </script>
```
スペースキーで音声認識が開始し、qキーで停止する。
