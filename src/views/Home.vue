<template>
  <section class="mixin-components-container">
    <div class="box-card">
      <div class="title-box">
        <p class="songName">{{ songName }}</p>
      </div>
      <div id="waveform" ref="waveform"></div>
      <div class="player_controls">
        <button @click="playPre(filePath)" class="btn">
          <i class="fa fa-backword"></i>
        </button>
        <button @click="playMusic" class="btn">
          <i v-if="playing" class="fa fa-fw fa-pause"></i
          ><i v-else class="fa fa-fw fa-play"></i>
        </button>
        <button @click="playNext(filePath)" class="btn">
          <i v-if="playing" class="fa fa-forward"></i>
        </button>
        <button class="btn">
          <div class="volum-control">
            <i class="fa fa-volume-up" aria-hidden="true"></i>
            <input
              type="range"
              v-model="vol"
              class="volume"
              :style="
                `background-image:linear-gradient(to right, ${fillColor},${fillColor} ${percent},${emptyColor} ${percent})`
              "
              min="0"
              max="100"
              id="fader"
              @input="changeVol"
            />
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import WaveSurfer from "wavesurfer.js";
import { ipcRenderer, remote } from "electron";
var path = require("path");
var fs = require("fs");
// const {ipcRenderer} = window.require("electron");
// const remote = require("electron").remote;
const { Readable } = require("stream");
const streamToBlob = require("stream-to-blob");

export default {
  name: "Home",
  data() {
    return {
      wavesurfer: null,
      filePath: "",
      playing: false,
      songName: "",
      fillColor: "rgba(48, 113, 169, 0.8)",
      emptyColor: "rgba(48, 113, 169, 0.4)",
      percent: "30%",
      vol: 30
    };
  },
  mounted() {
    this.initWave();
    // 首次加载
    // const originPath = remote.process.argv[1];
    const originPath = 'I:\\CloudMusic\\宮野幸子,森下唯 - 月華の円舞曲 -Valse di Fantastica-.mp3';
    this.loadMusic(originPath);

    // 监听主进程传来的第二首歌的本地路劲
    ipcRenderer.on("path", (event, arg) => {
      const newOriginPath = arg;
      this.loadMusic(newOriginPath);
    });
  },
  methods: {
    // 初始化
    initWave() {
      this.wavesurfer = WaveSurfer.create({
        container: this.$refs.waveform,
        barWidth: 2,
        barHeight: 1,
        barGap: 1,
        barRadius: 2,
        waveColor: "#006d75",
        progressColor: "#597ef7",
        backend: "MediaElement",
        mediaControls: false,
        audioRate: "1"
      });
    },

    // 将二进制转换为流
    bufferToStream(binary) {
      const readableInstanceStream = new Readable({
        read() {
          this.push(binary);
          this.push(null);
        }
      });
      return readableInstanceStream;
    },

    // 加载歌曲
    loadMusic(localPath) {
      let fileUrl;
      this.filePath = localPath;
      this.songName = path.basename(localPath);
      // 读取文件
      const buffer = fs.readFileSync(localPath);
      // 将buffer转换为node可读流
      const stream = this.bufferToStream(buffer);
      streamToBlob(stream)
        .then(res => {
          fileUrl = res;
          // blob对象转换为对象URL
          const filePath = window.URL.createObjectURL(fileUrl);
          this.wavesurfer.load(filePath);
          // 开始播放
          this.wavesurfer.play();
          this.playing = true;
        })
        .catch(err => {
          // 对错误做处理
          console.log({ err });
        });
    },

    // 播放/暂停按钮
    playMusic() {
      this.playing = !this.playing;
      this.wavesurfer.playPause.bind(this.wavesurfer)();
    },

    // 调节音量
    changeVol(e) {
      console.log({ e });
      const { value, min, max } = e.target;
      const rate = (value - min) / (max - min);
      this.percent = 100 * rate + "%";
      this.wavesurfer.setVolume(+rate);
    },

    playFileList(localPath, pos) {
      let isInFiles,
        fileIndex,
        preIndex,
        nextIndex,
        fullPath,
        dirPath = path.dirname(localPath),
        basename = path.basename(localPath);
      fs.readdir(localPath, (err, files) => {
        isInFiles = files.includes(basename);
        if (isInFiles && pos === "pre") {
          fileIndex = files.indexOf(basename);
          preIndex = fileIndex - 1;
          fullPath = path.resolve(dirPath, files[preIndex]);
          this.loadMusic(fullPath);
        }
        if (isInFiles && pos === "next") {
          fileIndex = files.indexOf(basename);
          nextIndex = fileIndex + 1;
          fullPath = path.resolve(dirPath, files[nextIndex]);
          this.loadMusic(fullPath);
        }
      });
    },

    // 播放上一首
    playPre(localPath) {
      this.playFileList(localPath, "pre");
    },

    // 播放下一首
    playNext(localPath) {
      this.playFileList(localPath, "next");
    }
  }
};
</script>

<style lang="scss" scoped>
.mixin-components-container {
  .title-box {
    width: 200px;
    margin: 0 auto;
    overflow: hidden;
    .songName {
      text-align: center;
      padding-left: 20px;
      font-size: 16px;
      color: #fff;
      display: inline-block;
      white-space: nowrap;
      animation: 10s wordsLoop linear infinite normal;
    }
    @keyframes wordsLoop {
      0% {
        transform: translateX(200px);
        -webkit-transform: translateX(200px);
      }
      100% {
        transform: translateX(-100%);
        -webkit-transform: translateX(-100%);
      }
    }

    @-webkit-keyframes wordsLoop {
      0% {
        transform: translateX(200px);
        -webkit-transform: translateX(200px);
      }
      100% {
        transform: translateX(-100%);
        -webkit-transform: translateX(-100%);
      }
    }
  }
  #waveform {
    -webkit-app-region: no-drag;
    margin: 0 20px;
  }
  .player__controls {
    width: 50%;
    margin: 0 auto;
    display: flex;
    margin-top: 30px;
    // background: #1e1e21;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .btn {
      width: 100px;
      height: 100px;
      padding: 30px;
      color: #fff;
      font-size: 25px;
      background-color: transparent;
      outline: none;
      border: none;
      &:hover {
        cursor: url(../assets/img/pointer.png), pointer;
        // background: #2a2931;
      }
    }
    .volum-control {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: flex-start;
      align-items: center;
      &:hover {
        .volume {
          display: block;
        }
      }
    }
    .volume {
      display: none;
      -webkit-app-region: no-drag;
      width: 100px;
      height: 8px;
      margin-left: 5px;
      appearance: none;
      outline: none;
      border-radius: 8px;
      &::-webkit-slider-thumb {
        appearance: none;
        width: 8px;
        background-color: #3071a9cc;
        border: 8px solid #3071a9cc;
        border-radius: 100%;
        cursor: pointer;
      }
    }
  }
}
</style>
