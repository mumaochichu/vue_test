<template>
  <div class="mapContainer">
    <!-- 地图容器 -->
    <div ref="viewDiv"
         class="view">
    </div>
    <!--地图要素-->
    <ToolsView />
    <div class="infoBox">
      <span v-text="mouseposition"
            class="positionInfo">地图级别---</span>
      <span v-text="mapextent"
            class="positionInfo">坐标---</span>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { getAllData } from '../api/api'
import esriLoader from 'esri-loader'  //地图加载器
import moniterVue from '../views/DataMonitor.vue'
import monitor_png from '../assets/images/video.png'
import arrow_png from '../assets/mapwindow_tail.png'
import { mapState, mapGetters } from 'vuex'
import ToolsView from './tool.vue'     //地图工具组件
export default {
  data () {
    return {
      mouseX: null,
      mouseY: null,
      extent: null,
      dataList_rlt: [],
      arrow_png: arrow_png,
      monitor_png: monitor_png,
      NUM: '',
      name: '',
      ds_msg: 'MAP'
    };
  },
  components: {
    ToolsView
  },
  //监听属性：监听变量值发生变化执行相应函数)
  watch: {
    iotData: {
      handler (newval, oldval) {
        let result = []
        if (!oldval.length) result = newval
        else {
          result = newval.filter(item => {
            let obj = oldval.find(a => a.Id == item.Id && a.Num != item.Num)
            // if(obj){
            //   obj.Num=isNaN(obj.Num)?0:obj.Num
            // }
            return obj
          })
        }
        result.map(item => {
          let labelid = item.Id && item.Id.trim()
          if (labelid) {
            let label = document.getElementById('mapWindow_' + labelid)
            let span = label ? label.getElementsByTagName("span")[0] : null
            span && (span.innerHTML = "数值：" + item.Num)
          }
        })
      },
      deep: true
    }
  },
  //计算属性：描述的一个值依赖于其它值，依赖的值改变后重新计算结果更新DOM
  computed: {
    ...mapState(['iotData']),
    ...mapGetters(["formatedData"]),
    mouseposition: function () {
      return "坐标：" + this.mouseX + "," + this.mouseY;
    },
    mapextent: function () {
      return "地图级别：" + this.extent;
    }
  },
  mounted () {
    //订阅
    this.$bus.$on('DST-to-Map', e => {
      console.log(e)
    })
    //初始化地图(通过vue提供的ref属性以及this.$refs即可获取dom,$refs 只会在组件渲染完成之后生效，并且不是响应式的)
    this.arcgisInit(this.$refs.viewDiv);
  },
  methods: {
    /**
     * 初始化地图
     */
    arcgisInit (div) {
      var that = this;
      //arcgis api js文件
      const options =
      {
        url: window.arcjsUrl
      };
      //加载arcgis api css文件
      esriLoader.loadCss(window.arcCssUrl);
      //加载模块
      esriLoader
        .loadModules(
          [
            "esri/map",
            "esri/layers/TileInfo",
            "esri/layers/WebTiledLayer",
            "esri/layers/GraphicsLayer",
            "esri/geometry/Point",
            "dojo/dom",
            "dojo/on",
            "dojo/domReady!"
          ],
          options
        )
        .then(([
          Map
        ]) => {
          //地图中心点
          var mapPoint = new esri.geometry.Point([117.124674, 36.657017], new esri.SpatialReference({ wkid: 4490 }));
          //地图参数
          var config = {
            width: "100%",
            logo: false,
            zoom: 4,
            slider: false,
            fadeOnZoom: true,
            center: mapPoint
            //force3DTransforms: true
          };
          //创建地图
          var map = new esri.Map(div, config); //ersi.Map类是一种容器，其中可以放置图层等。div为显示地图的DIV；config为地图相关参数设置
          //window属性上定义变量map,内容为新创建的地图对象map
          window.map = map
          //通过瓦片形式加载天地图，设定瓦片信息
          var tileInfo = new esri.layers.TileInfo({
            "rows": 256,//瓦片行编号
            "cols": 256,//瓦片列编号
            "compressionQuality": 0,
            "origin": {
              "x": -180,
              "y": 90
            },
            "spatialReference": {
              "wkid": 4490
            },
            "lods": [
              {
                "level": 2,//level:当前缩放级别,包括两个参数：resolution:比例尺和scale:分辨率
                "resolution": 0.3515625,
                "scale": 147748796.52937502
              },

              {
                "level": 3,
                "resolution": 0.17578125,
                "scale": 73874398.264687508
              },

              {
                "level": 4,
                "resolution": 0.087890625,
                "scale": 36937199.132343754
              },

              {
                "level": 5,
                "resolution": 0.0439453125,
                "scale": 18468599.566171877
              },

              {
                "level": 6,
                "resolution": 0.02197265625,
                "scale": 9234299.7830859385
              },

              {
                "level": 7,
                "resolution": 0.010986328125,
                "scale": 4617149.8915429693
              },

              {
                "level": 8,
                "resolution": 0.0054931640625,
                "scale": 2308574.9457714846
              },

              {
                "level": 9,
                "resolution": 0.00274658203125,
                "scale": 1154287.4728857423
              },

              {
                "level": 10,
                "resolution": 0.001373291015625,
                "scale": 577143.73644287116
              },

              {
                "level": 11,
                "resolution": 0.0006866455078125,
                "scale": 288571.86822143558
              },

              {
                "level": 12,
                "resolution": 0.00034332275390625,
                "scale": 144285.93411071779
              },

              {
                "level": 13,
                "resolution": 0.000171661376953125,
                "scale": 72142.967055358895
              },

              {
                "level": 14,
                "resolution": 8.58306884765625e-005,
                "scale": 36071.483527679447
              },

              {
                "level": 15,
                "resolution": 4.291534423828125e-005,
                "scale": 18035.741763839724
              },

              {
                "level": 16,
                "resolution": 2.1457672119140625e-005,
                "scale": 9017.8708819198619
              },

              {
                "level": 17,
                "resolution": 1.0728836059570313e-005,
                "scale": 4508.9354409599309
              },

              {
                "level": 18,
                "resolution": 5.3644180297851563e-006,
                "scale": 2254.4677204799655
              }
            ]
          });
          /**
           * 添加底图
           * @baseMap 矢量底图
           * @baseMapMarker 地图标注
           */
          //经纬度矢量地图瓦片的URL: http://t4.tianditu.com/DataServer?T=vec_c&X=27&Y=3&L=5
          //域名中的 t4 部分代表子域字段，X是列编号，Y是行编号 ，L是当前缩放级别。对这几个部分用列表里的参数替换，后面再加上key,就变成了下面的样子
          var baseMap = new esri.layers.WebTiledLayer("http://{subDomain}.tianditu.com/DataServer?T=vec_c&X={col}&Y={row}&L={level}&tk=01d49b21f6fe3cc75c89d1b23de98fe0", {
            "copyright": "Tianditu",
            "id": "Tianditu",
            "subDomains": ["t0", "t1", "t2"],//经查询天地图瓦片分别有t0,t1,t2,t3,t4,t5,t6,t7八个子域
            "tileInfo": tileInfo
          });
          //添加矢量底图
          map.addLayer(baseMap);
          //同上
          var baseMapMarker = new esri.layers.WebTiledLayer("http://{subDomain}.tianditu.com/DataServer?T=cva_c&X={col}&Y={row}&L={level}&tk=01d49b21f6fe3cc75c89d1b23de98fe0", {
            "copyright": "Tianditu",//版权，Web平铺层提供程序的归属。它显示在网络地图的归属中。将图层添加到Web地图时用户所需的输入。
            "id": "Tianditu2",//图层的唯一标识字符串。
            "subDomains": ["t0", "t1", "t2"],//子域，如果检测到子域，则必须指定它们。地图查看器通过解析{subDomain}的templateURL值来检测Web Tiled图层是否具有子域。
            "tileInfo": tileInfo //包含空间参考和图层的平铺方案。通常从WMTS OGC Web服务检索。如果缺少该图层，则必须使用WGS 1984 Web Mercator（辅助球）拼贴方案。
          });
          //添加矢量标注
          map.addLayer(baseMapMarker);
          //设置地图中心点
          map.centerAt(new esri.geometry.Point({
            "x": 117.124674,
            "y": 36.657017,
            "spatialReference": {
              "wkid": 4490
            }
          }), 13);
          //设置地图级别
          map.setLevel(13);
          let para = {}
          //新建实时数据图层
          var layer_monitor = new esri.layers.GraphicsLayer({ id: 'monitor' })
          //热力图及实时数据图层
          getAllData(para).then((res) => {
            this.dataList_rlt = res.data.response
            var features = []
            for (let i = 0; i < this.dataList_rlt.length; i++) {
              for (let j = 0; j < this.iotData.length; j++) {
                if (this.iotData[j].Id == this.dataList_rlt[i].Id) {
                  //如果要显示标注，需要有坐标信息
                  if (this.dataList_rlt[i].X != 0 && this.dataList_rlt[i].Y != 0) {
                    //创建几何点
                    var pt_monitor = new esri.geometry.Point([this.dataList_rlt[i].X, this.dataList_rlt[i].Y], new esri.SpatialReference({ wkid: 4490 }));
                    var pointSymbol = new esri.symbol.PictureMarkerSymbol(monitor_png, 20, 20);
                    //定义graphic的名称-值对
                    var attr = {
                      "Id": this.dataList_rlt[i].Id,
                      "Name": this.dataList_rlt[i].Name,
                      "Num": this.dataList_rlt[i].Num,
                      "Note": this.dataList_rlt[i].Note,
                    }
                    if (window.arcgisMap.MapWindow.isOpenedByID(this.dataList_rlt[i].Id) == false) {
                      var name = this.iotData[j].Name;  //this.dataList_rlt[i].Name
                      this.iotData[j].Note = (this.iotData[j].Note != null) ? this.iotData[j].Note : "--"
                      var html2 = ""
                      html2 =
                        '<div id="' + this.dataList_rlt[i].Id +
                        '" class="mapWindow_monitor" style="display:block;width:250px;position: absolute;z-index: 200;left: 10px; top: -20px;opacity: 0.8;">' +
                        '<div style="background-image: url(' + arrow_png + ');background-repeat: no-repeat;background-position: center;float: left;width: 11px; height: 31px;z-index: 2;">' +
                        '</div>' +
                        '<div class="mapWindow_monitor_body" style=" float: left; background-color: #00457b;bottom: 10px;top: 0px;left: 0px;right: 0px;z-index: 2;border: 1px solid #7597ba;border-radius: 7%;box-shadow: 0px 2px 5px #888888;padding: 2px;">' +
                        '<div class="mapWindow_monitor_name" style=" height: 20px;line-height: 20px;text-align: center;background-color: #00457b;color: #fff;font-weight: bold;text-align: center;font-size: 13px; border-bottom: 1px solid #ccc;">' + name + '</div>' +
                        '<ul class="mapWindow_monitor_content" style="  list-style: none;padding: 0;margin: 0;">'
                        + ' <li class="mapWindow_monitor_normal" style=" line-height: 20px;text-align: left;color: #fff;font-size: 11px;background-color: #0147b1 !important;font-family: Microsoft YaHei;list-style: none;padding: 0; margin: 0;border-left: 1px solid #817f7f; border-right: 1px solid #817f7f;border-bottom: 1px solid #817f7f;">' +
                        ' <span>' + "数值：" + this.iotData[j].Num + '</span>' +
                        '</li>' +
                        ' <li style=" line-height: 20px;text-align: left;color: #fff;font-size: 11px;background-color: #0147b1 !important;font-family: Microsoft YaHei;list-style: none;padding: 0; margin: 0;border-left: 1px solid #817f7f; border-right: 1px solid #817f7f;border-bottom: 1px solid #817f7f;">' +
                        ' <span>' + "备注：" + this.iotData[j].Note + '</span>' +
                        '</li>' +
                        '</ul></div></div>'
                        ;
                      //显示地图窗体控件
                      map && window.arcgisMap.MapWindow.showLabel(this.dataList_rlt[i].Id, map, pt_monitor, html2, true);
                    }
                    var graphic_monitor = new esri.Graphic(pt_monitor, pointSymbol, attr);
                    layer_monitor.add(graphic_monitor);
                    //手动构建热力图所用几何对象(和注释部分同等效果)
                    var graphic_rlt = {
                      "attributes": {
                        "OBJECTID": i,
                        "X": this.dataList_rlt[i].X,
                        "Y": this.dataList_rlt[i].Y,
                        "LEVEL": this.dataList_rlt[i].Num,
                      },
                      "geometry": {
                        "x": this.dataList_rlt[i].X,
                        "y": this.dataList_rlt[i].Y
                      }
                    };
                    //将标注点对象添加到features数组里
                    features.push(graphic_rlt);
                  }

                }
              }

            }
            /**
              * 构建数量热力图
              * @param {Object} features 点图形数组
              * @param {Object} spatialReference 空间参考
              * */
            //一、手动构建FeatureLayer
            //1，构建fields
            var fields = [
              { name: "OBJECTID", type: "esriFieldTypeOID", alias: "OBJECTID", editable: true },
              { name: "X", type: "esriFieldTypeDouble", alias: "X", length: 20, editable: true },
              { name: "Y", type: "esriFieldTypeDouble", alias: "Y", length: 20, editable: true },
              { name: "LEVEL", type: "esriFieldTypeDouble", alias: "LEVEL", length: 20, editable: true }
            ];
            //2,定义空间参考 
            var spatialReference = new esri.SpatialReference({ wkid: 4490 });
            //3,构建featureSetJson
            var featureSetJson = {
              displayFieldName: "",
              geometryType: "esriGeometryPoint",
              fieldAliases: {
                OBJECTID: "OBJECTID",
                X: "X",
                Y: "Y",
                LEVEL: "LEVEL"
              },
              fields: fields,
              spatialReference: spatialReference,
              features: features
            };
            //4，构建FeatureSet
            var featuresSet = new esri.tasks.FeatureSet(featureSetJson);
            //5，构建layerDefinition
            var layerDefinition = {
              "geometryType": "esriGeometryPoint",
              "fields": fields
            };
            //6，构建featureCollection
            var featureCollection = {
              layerDefinition: layerDefinition,
              featureSet: featuresSet
            };
            //创建featureLayer
            var featureLayer = new esri.layers.FeatureLayer(featureCollection, {
              showLabels: true,
              id: "rlt",          //图层id
              outFields: ["*"],
            });
            //二、渲染
            //创建热力图渲染器
            var heatmapRenderer = new esri.renderer.HeatmapRenderer({
              //colors: ["rgba(255, 0, 0, 0)", "rgb(0, 255, 0)", "rgb(255, 255, 0)", "rgb(255, 0, 0)"],
              blurRadius: 24,
              //field: "LEVEL",     //作为数据点权重值的属性字段，根据其进行渲染
              colorStops: [
                { ratio: 0, color: "rgb(250, 250, 0,0)" },
                { ratio: 0.5, color: "rgb(250, 150, 0)" },
                { ratio: 0.85, color: "rgb(255, 50, 0)" }],
            });
            //设置渲染方式
            featureLayer.setRenderer(heatmapRenderer);
            //将热力图featureLayer图层添加到地图上
            window.map.addLayer(featureLayer);
            window.map.addLayer(layer_monitor);
            //为模拟实时数据图层添加单击事件
            var timer = null;
            var L = this.$layer;
            var T = this;
            //单击事件(弹窗)
            layer_monitor.on('click', (e) => {
              //清除第一次的单击事件
              clearTimeout(timer);
              //给单击事件添加一个计时器,当单击事件还没有触发时,取消这个事件,最后就只有双击事件的内容触发了
              //setTimeout 计时器(延时器)
              timer = setTimeout(function () {
                //在弹出窗体前关闭所有layer窗体
                //L.closeAll();
                //弹出窗体
                L.iframe({
                  content: {
                    content: moniterVue,  //传递的组件对象
                    parent: T,           //当前的组件对象
                    data: {                  //传递的参数
                      info: { data: e.graphic.attributes }
                    }
                  },
                  area: ["510px", "510px"],
                  title: e.graphic.attributes.Name + "-数据监测",
                  //offset: 'right top',
                  maxmin: true,
                  shade: false,
                  shadeClose: false,
                  resize: true,

                });
              }, 500, e)    //将参数e传递到setTimeout函数里
            })
            //layer_monitor.setVisibility(false)
            //鼠标移入事件（打开弹窗）
            layer_monitor.on('mouse-over', (e) => {
              let id = e.graphic.attributes.Id
              var html = document.getElementById(id)
              html.style.display = 'block'
            })
            //鼠标移出事件（关闭弹窗）
            layer_monitor.on('mouse-out', (e) => {
              let id = e.graphic.attributes.Id
              var html = document.getElementById(id)
              html.style.display = 'none'
            })
            featureLayer.setVisibility(false)
          })

          //关闭键盘导航
          map.disableKeyboardNavigation()
          //监听地图缩放事件
          map.on('extent-change', that.onExtentChange);
          //监听鼠标移动事件（throttle节流函数，节流是持续触发事件，会每隔一段时间，才执行执行一次）
          map.on('mouse-move', _.throttle(that.mapMouseMove, 500));
        }).catch(err => {
          console.error(err)
        })


    },
    /**
     * 获取地图坐标
     */
    mapMouseMove (evt) {
      if (evt != null) {
        //console.log(evt.mapPoint.y)
      }
      [this.mouseY, this.mouseX] = [evt.mapPoint.y.toFixed(3), evt.mapPoint.x.toFixed(3)];
    },
    /**
     * 获取地图地图级别
     */
    onExtentChange (evt) {
      this.extent = evt.lod.level
    }
  },
  beforeDestroy () {
    //销毁
    this.$bus.$off('DST-to-Map');
  },
};
</script>

<style scoped>
.mapContainer {
  width: 100%;
  height: 100%;
  z-index: -1;
}
.view {
  width: 100%;
  height: 100%;
  z-index: -1;
}
.infoBox {
  position: absolute;
  bottom: 20px;
  right: 10px;
  height: 30px;
  background-color: #1f5f9a;
  opacity: 0.95;
}

.infoBox .positionInfo {
  color: white;
  font-size: 0.5em;
  line-height: 30px;
  margin: 0 10px;
}
.infoBox .map-legend {
  cursor: pointer;
}
.blurInfo {
  display: none;
  position: absolute;
  top: 10px;
  right: 5px;
  font-size: 1.25em;
  font-family: monospace;
  color: #4c4c4c;
  width: 240px;
  background-color: #ffffff;
  padding: 10px;
  border: 2px solid #57585a;
  border-radius: 20px;
}
.blurInfo p span {
  background-color: #ffffff;
  padding: 0 5px;
  border-radius: 5px;
}
.blurInfo input[type="range"] {
  width: 100%;
  display: block;
}
.mapWindow_monitor_normal {
  line-height: 20px;
  text-align: center;
  color: #fff;
  font-size: 11px;
  background-color: #0147b1 !important;
  font-family: "Microsoft YaHei";
  list-style: none;
  padding: 0;
  margin: 0;
  border-left: 1px solid #817f7f;
  border-right: 1px solid #817f7f;
  border-bottom: 1px solid #817f7f;
}
.mapWindow_monitor_name {
  height: 20px;
  line-height: 20px;
  /* width: 100%; */
  text-align: center;
  background-color: #00457b;
  color: #fff;
  font-weight: bold;
  text-align: center;
  font-size: 13px;
  border-bottom: 1px solid #ccc;
}
.mapWindow_monitor_content {
  list-style: none;
  padding: 0;
  margin: 0;
}
.mapWindow_monitor_body {
  float: left;
  background-color: #00457b;
  bottom: 10px;
  top: 0px;
  left: 0px;
  right: 0px;
  z-index: 2;
  border: 1px solid #7597ba;
  border-radius: 7%;
  box-shadow: 0px 2px 5px #888888;
  padding: 2px;
}
.mapWindow_monitor_corner {
  background-image: url(../assets/mapwindow_tail.png);
  background-repeat: no-repeat;
  background-position: center;
  float: left;
  width: 11px;
  height: 31px;
  z-index: 2;
}
.mapWindow_monitor {
  width: 250px;
  position: absolute;
  /* height: 55px; */
  z-index: 200;
  left: 10px;
  top: -20px;
  opacity: 0.8;
}
</style>