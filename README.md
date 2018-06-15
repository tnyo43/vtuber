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
<vtuber-frame id="vtubertag"></vtuber-frame>
<script type="module">
  import VTuberFrame from './static/VTuberFrame.js'

  let vtag = document.getElementById('vtubertag');
  vtag.src = 'static/img/dedenne.png';
  
  /// もしコールバック関数を設定したいなら
  /// 変数xは顔の情報を持つ71点の配列
  let callback = (x) => {
      console.log(x);
  }
  vtag.callback = callback;
  
  /// VTuberFrameを起動する。
  vtag.self_active = true;
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

<script>

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
