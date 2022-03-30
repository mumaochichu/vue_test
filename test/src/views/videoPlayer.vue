<template>
  <div>
    <div :id="divID" style="height:300px"></div>
    <!-- <video ref="myvideo" style="width:100%;height:200px;"></video> -->
  </div>
</template>
<script>
import { aliPlayer } from "../../util/strUtil";
export default {
  data() {
    return {
      videos: [],
      path: window.VUE_APP_TAGCONFIG_PATH, //process.env.VUE_APP_VIDEO_PATH,
      socket: null,
      divID: "",
      player: null,
      //nvfid:this.lydata.nvfid
    };
  },
  props: ["nvfid"],
  created() {

    this.init();
  },
  watch: {
    nvfid() {
      this.send();
    },
  },
  methods: {
    init() {
      this.divID = "v" + this.nvfid.replace(/-/g, "");
      if (typeof WebSocket === "undefined") {
        // alert("您的浏览器不支持socket");
        this.$notify.error({
          title: "错误",
          message: "您的浏览器不支持websocket",
        });
      } else {
        // 实例化socket
        this.socket = new WebSocket(this.path);
        console.log(this.socket)
        // 监听socket连接
        this.socket.onopen = this.open;
        // 监听socket错误信息
        this.socket.onerror = this.error;
        // 监听socket消息
        this.socket.onmessage = this.getMessage;
        //监听关闭连接
        this.socket.onclose = this.close;
      }
    },
    open() {
      this.send();
    },
    error() {
      console.log("连接错误");
      setTimeout(() => {
        this.init();
      }, 1000);
    },
    getMessage(msg) {
      this.loadVideo(msg);
    },
    loadVideo(msg) {
      let data = JSON.parse(msg.data);
      if (data.Success) {
        if (this.player) {
          this.player.dispose();
        }
        console.log(data.Url)
        this.player = aliPlayer(this.divID, data.Url, true);
      } else {
        let html = '<p class="prism-info-display">' + data.Message + "</p>";
        document.getElementById(this.divID).innerHTML = html;
      }
    },
    send() {
      if (this.nvfid && this.socket.readyState == 1)
        this.socket.send(this.nvfid);
    },
    close() {
      console.log("socket已经关闭");
    },
  },
  beforeDestroy() {
    if (this.player) this.player.dispose();
    this.socket.close();
  },
  destroyed() {
    this.$off();
    this.$destroy();
  },
};
</script>
<style scoped>
.fullscreen {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}
</style>