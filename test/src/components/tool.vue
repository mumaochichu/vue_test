<!--地图工具-->
<template>
  <div class="tools">
    <div v-for="(item, i) in tools"
         :key="i"
         type="primary"
         size="mini"
         @mouseenter="addPoint(i)"
         @mouseleave="removePoint()"
         :title="item.text"
         @click="handleClick(item.excuteScript)">
      <img v-if="i == toolHighLightInex || i == toolClick"
           :src="item.hover_bg"
           :alt="item.text"
           width="24px"
           height="24px"
           style="padding: 2px 0 0 0" />
      <img v-else
           :src="item.icon"
           :alt="item.text"
           width="24px"
           height="24px"
           style="padding: 2px 0 0 0" />
    </div>
  </div>
</template>
<script>
import layerControl from "./layerControl";

export default {
  data () {
    return {
      layerControlIndex: "",
      mapLocationIndex: "",
      legendIndex: "",
      toolHighLightInex: -1,
      toolClick: -1,
      tools: [
        {
          hover_bg: require("../assets/images/gjl-7-quanpingxianshi_h.png"),
          icon: require("../assets/images/gjl-7-quanpingxianshi.png"),
          text: "恢复默认地图",
          excuteScript: "zoom2Fullextent",
        },
        {
          hover_bg: require("../assets/images/gjl-6-manyou_h.png"),
          icon: require("../assets/images/gjl-6-manyou.png"),
          text: "键盘导航",
          excuteScript: "keyboardNavigation",
        },
        {
          hover_bg: require("../assets/images/gjl-2-fangda_h.png"),
          icon: require("../assets/images/gjl-2-fangda.png"),
          text: "放大",
          excuteScript: "zoomOut",
        },
        {
          hover_bg: require("../assets/images/gjl-3-suoxiao_h.png"),
          icon: require("../assets/images/gjl-3-suoxiao.png"),
          text: "缩小",
          excuteScript: "zoomIn",
        },
        {
          hover_bg: require("../assets/images/gjl-1-qingchu_h.png"),
          icon: require("../assets/images/gjl-1-qingchu.png"),
          text: "清除临时图层",
          excuteScript: "clearTempLayer",
        },
        {
          hover_bg: require("../assets/images/gjl-8-tuceng_h.png"),
          icon: require("../assets/images/gjl-8-tuceng.png"),
          text: "图层管理",
          excuteScript: "layerControl",
        },
      ],
    };
  },
  methods: {
    handleClick (method) {
      this[method]();
    },
    /*恢复默认地图*/
    zoom2Fullextent: function () {
      this.toolClick = -1;
      let map = window.map
      //var layer = map.getLayer(map.layerIds[0]);
      // map.setExtent(layer && layer.fullExtent);
      var extent = new esri.geometry.Extent({
        "xmax": 117.14737621710205,
        "xmin": 117.10197178289795,
        "ymax": 36.67250943927002,
        "ymin": 36.641524560729984,
        "spatialReference": { "wkid": 4490 }
      });
      map.setExtent(extent);
      this.toolClick = 0;
    },
    /*键盘导航*/
    keyboardNavigation: function () {
      if (this.toolClick == -1) {
        let map = window.map
        //开启键盘导航
        map.enableKeyboardNavigation()
        this.toolClick = 0
      }
      else {
        let map = window.map
        //关闭键盘导航
        map.disableKeyboardNavigation()
        this.toolClick = -1
      }

    },
    /*地图放大*/
    zoomOut: function () {
      this.toolClick = -1;
      let map=window.map
      var extent =map.extent;
      var newExtent = extent.expand(0.5);
      map.setExtent(newExtent);
      this.toolClick = 2;
    },
    /*地图缩小*/
    zoomIn: function () {
      this.toolClick = -1;
      let map=window.map
      var extent = map.extent;
      var newExtent = extent.expand(2);
      map.setExtent(newExtent);
      this.toolClick = 3;
    },
    /*清除临时图层（隐藏临时图层）*/
    clearTempLayer: function () {
      this.toolClick = -1;
      let map=window.map
      //隐藏地图弹窗
      map.infoWindow.hide()
      //遍历图层隐藏
      let layerIds = map.graphicsLayerIds;
      for (var i = 0; i < layerIds.length; i++) {
        let layer = map.getLayer(layerIds[i]);
        if (layer.visible == true) {
          layer.setVisibility(false);
        }
      }
      this.toolClick = 6;
    },
    /*图层管理*/
    layerControl: function () {
      this.toolClick = -1;
      if (this.layerControlIndex != "") {
      } else {
        this.layerControlIndex = this.$layer.iframe({
          content: {
            content: layerControl,
            parent: this,
          },
          area: ["200px", "300px"],
          offset: [window.screenLeft + document.body.clientWidth - 140, 300],
          title: "图层管理",
          maxmin: false,
          shade: false,
          shadeClose: false,
          cancel: () => {
            //关闭事件
            (this.layerControlIndex = ""), this.$layer.close(this.layerid);
            if (this.toolClick == 7) {
              this.toolClick = -1;
            }
          },
        });
      }
      this.toolClick = 7;
    },
    /*鼠标进入事件*/
    addPoint: function (i) {
      let _this = this;
      _this.toolHighLightInex = i;
    },
    /*鼠标移出事件*/
    removePoint: function () {
      let _this = this;
      _this.toolHighLightInex = -1;
    },
  },
};
</script>
<style scoped>
.tools {
  left:100px;
  display: flex;
  bottom:20px;
  position: absolute;
}
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
li {
  display: inline;
  width: 29px;
  margin: 0;
  padding: 0;
}
.tools > div {
  padding: 3px 8px;
  background-color: #1f5f9a;
  border-left: 1px solid #3f77a5;
}
.tools > div:first-child {
  border-radius: 4px 0 0 4px;
  border-left: none;
}
.tools > div:last-child {
  border-radius: 0 4px 4px 0;
}
.tools > div:hover {
  cursor: pointer;
  background-color: #539ae2;
}
</style>