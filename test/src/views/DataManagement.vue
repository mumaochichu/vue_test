<template>
  <section style="overflow: hidden; height: 100%;">
    <span ref="app">{{name}}</span>
    <!--查询与新增-->
    <el-form :inline="true"
             style="float: right; height: 10%;margin-top: 1%;"
             size="mini"
             class="serchFrom">
      <el-form-item>
        <label>名称：</label>
        <el-input v-model="query"
                  style="width: 150px;"
                  placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleSearch"
                   type="primary">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary"
                   @click="handleAdd"
                   icon="el-icon-circle-plus">新增</el-button>
      </el-form-item>
    </el-form>
    <!--表格-->
    <el-table :data="tableList"
              stripe
              border
              highlight-current-row
              v-loading="listLoading"
              @row-dblclick="position"
              :header-cell-style="{'text-align': 'center'}"
              :cell-style="{'text-align': 'center'}"
              size="mini"
              height="80%"
              style="width: 100%">
      <el-table-column type="index"
                       label="序号"> </el-table-column>
      <el-table-column prop="Name"
                       label="名称"
                       width="150">
      </el-table-column>
      <el-table-column prop="X"
                       label="X坐标">
      </el-table-column>
      <el-table-column prop="Y"
                       label="Y坐标">
      </el-table-column>
      <el-table-column prop="Num"
                       label="数量">
      </el-table-column>
      <el-table-column prop="Attachment"
                       v-if="false"
                       label="附件">
      </el-table-column>
      <el-table-column prop="CreateTime"
                       width="100"
                       :formatter="formatDateTime_CTEATETIME"
                       label="创建时间">
      </el-table-column>
      <el-table-column prop="Note"
                       label="备注">
      </el-table-column>
      <el-table-column label="操作"
                       align="center"
                       width="280">
        <!-- width="200" -->
        <template slot-scope="scope">
          <el-button type="primary"
                     icon="el-icon-edit"
                     @click="handleEdit(scope.$index, scope.row)"
                     size="mini">编辑</el-button>
          <el-button type="success"
                     icon="el-icon-more-outline"
                     @click="handleDetail(scope.$index, scope.row)"
                     size="mini">详情</el-button>
          <el-button type="danger"
                     icon="el-icon-delete"
                     @click="handleDelete(scope.$index,scope.row)"
                     size="mini">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <el-col :span="24">
      <el-pagination background
                     small
                     layout="total, slot,prev, pager, next,jumper"
                     @current-change="handleCurrentChange"
                     :total="total"
                     :page-size="pageSize"
                     style="float: right; height: 10%;">
        <span style="margin-right: 10px; font-weight: 400; color: #606266;">(每页10条)</span>
      </el-pagination>
    </el-col>
  </section>
</template>

<script>
import _ from 'lodash'
import { getData, getAllData, DeleteDataById } from '../api/api'
import Add from './HandleDataManagement/Add.vue'
import Edit from './HandleDataManagement/Edit.vue'
import Detail from './HandleDataManagement/Detail.vue'
import esriLoader from "esri-loader"
import RedPin1LargeB from '@/assets/images/RedPin1LargeB.png';
import GreenPin1LargeB from '@/assets/images/GreenPin1LargeB.png'
import BluePin1LargeB from '@/assets/images/BluePin1LargeB.png';
import { mapState, mapGetters } from 'vuex'
import MAP from '../../util/MAP'
import format from '../date.js'
export default {
  //data是一个函数，返回一个对象，保证组件实例之间的data属性不会互相影响
  data () {
    return {
      total: 0,
      page: 1,
      pageSize: 10,
      query: '',
      name: "app",
      listLoading: false,
      activeIndex: 1,
      menuList: [],
      tableList: [],    //表格数据  
      allList: [],    //所有数据
      RedPin1LargeB: RedPin1LargeB,
      GreenPin1LargeB: GreenPin1LargeB,
      BluePin1LargeB: BluePin1LargeB,
    }
  },
  //计算属性：描述的一个值依赖于其它值，依赖的值改变后重新计算结果更新DOM(用来监控自己定义的变量，该变量不在data里面声明，直接在computed里面定义，然后就可以在页面上进行双向数据绑定展示出结果或者用作其他处理)
  computed: {
    //辅助函数，和下面注释掉的内容是相同的效果
    ...mapState(['iotData']),   
    // iotData () {
    //   return this.$store.state.iotData
    // },
    ...mapGetters(["formatedData"]),
  },
  //子组件通过props获取父组件传递的数据
  props: {
    info: {
      type: Object,
      default: () => {
        return {}
      },
    },
    layerid: {
      type: String,
      default: '',
    },
    lydata: {
      type: Object,
      default: () => {
        return {}
      },
    },
    lyoption: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  //watch的作用可以监控一个值的变换，并调用因为变化需要执行的方法。可以通过watch动态改变关联的状态
  watch: {
    //当iotData值发生改变时，执行getList方法
    iotData: {
      handler (newval, oldval) {
        let result = []
        if (!oldval.length) result = newval
        else {
          result = newval.filter(item => {
            let obj = oldval.find(a => a.Id == item.Id && a.Num != item.Num)
            return obj
          })
          if (result.length > 0) {
            this.getList()
          }
        }
      },
      deep: true    //深度观察
    },
    //输入框值改变时，执行handleQuery方法
    query: {
      handler (val, oldval) {
        //（禁止特殊字符输入处理(防SQL注入)）
        this.query = this.validSe_SQL(val)
        let old = this.validSe_SQL(oldval)
        if (this.query !== old) {
          this.handleQuery()
        }
      },
    },
  },
  //定义函数，手动调用
  methods: {
    //时间格式化方法
    formatDate (date, formatter) {
      let patter = formatter ? formatter : 'yyyy-MM-dd'
      return !date || date == '' ? '' : format.formatDate.format(new Date(date), patter)
    },
    //创建时间格式化
    formatDateTime_CTEATETIME (row, column) {
      return this.formatDate(row.CreateTime)
    },
    //页数改变
    handleCurrentChange (val) {
      this.page = val
      this.getList()
    },
    //获取数据
    async getList () {
      this.listLoading = true
      let para = {
        key: this.query,
      }
      let para_p = {
        key: this.query,
        page: this.page,
        intPageSize: this.pageSize,
      }
      //全部数据
      let res = await getAllData(para)
      //分页数据
      let res_p = await getData(para_p)
      let data = res.data.response
      let data_p = res_p.data.response
      data.forEach((item) => {
        for (let i = 0; i < this.iotData.length; i++) {
          if (item.Id == this.iotData[i].ID) {
            item.Num == this.iotData[i].NUM
          }
        }
      })
      this.allList = data
      this.tableList = data_p.data
      //console.table(JSON.parse(JSON.stringify(this.tableList)))
      this.total = data_p.dataCount
      this.page = data_p.page
      this.pageSize = data_p.PageSize
      this.listLoading = false
      //点聚集
      // let map=window.map
      //  map.infoWindow.hide()
      //隐藏地图弹窗
      this.addClusters(data)
    },
    //查询数据
    handleSearch () {
      this.name = this.query
      console.log(this.$refs.app.innerText);    //获取DOM，输出：原始值
      //nextTick()，是将回调函数延迟在下一次dom更新数据后调用
      this.$nextTick(function () {
        console.log(this.$refs.app.innerText);  //输出：修改后的值
      });
      this.getList()
    },
    //查询数据，_.debounce防抖动（（当持续触发事件时，会等到停止后一段时间才开始执行））函数，确保触发事件的时间间隔低于500毫秒时,则不会调用handleSearch函数
    handleQuery: _.debounce(function () {
      this.handleSearch()
    }, 500),
    //显示新增页面
    handleAdd () {
      var that = this
      this.$layer.iframe({
        content: {
          content: Add,
          parent: this,
          data: {
            //传递的参数
            info: {
              layerid_p: this.layerid,
            },
          },
        },
        area: ['370px', '550px'],
        title: '新增',
        maxmin: true,
        shade: false,
        shadeClose: false,
        resize: true,
        yes: () => {
          //刷新表格数据
          that.getList()
        },
      })
    },
    //显示编辑页面
    handleEdit (index, row) {
      var that = this
      this.$layer.iframe({
        content: {
          content: Edit,
          parent: this,
          data: {
            //传递的参数
            info: {
              //Id:row.Id,
              model: row,
              layerid_p: this.layerid,
            },
          },
        },
        area: ['370px', '550px'],
        title: '编辑',
        maxmin: true,
        shade: false,
        shadeClose: false,
        resize: true,
        yes: () => {
          //刷新表格数据
          that.getList()
        },
      })
    },
    //显示详情页面
    handleDetail (index, row) {
      var that = this
      this.$layer.iframe({
        content: {
          content: Detail,
          parent: this,
          data: {
            //传递的参数
            info: {
              Id: row.Id,
              model: row,
              layerid_p: this.layerid,
            },
          },
        },
        area: ['300px', '470px'],
        title: '详情',
        maxmin: true,
        shade: false,
        shadeClose: false,
        resize: true,
        yes: () => {
          //刷新表格数据
          //that.getList()
        },
      })
    },
    //删除数据
    handleDelete (index, row) {
      let Id = row.Id
      this.$confirm('是否删除数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'waring'
      }).then(() => {
        DeleteDataById(Id).then((res) => {
          if (res.data.success) {
            this.$message({
              message: res.data.msg,
              type: 'success',
            })
            //刷新表格
            this.getList()
          }
          else {
            this.$message({
              message: res.data.msg,
              type: 'error',
            })
          }
        }).catch((e) => {
          this.$message({
            message: e.message,
            type: 'error',
          })
        }).finally(() => {
          this.submitloading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        })
      })
    },
    //双击定位
    position (row) {
      let map = window.map
      const options =
      {
        url: window.arcjsUrl
      };
      //加载arcgis api css文件
      esriLoader.loadCss(window.arcCssUrl);
      //加载所需arcgis模块
      esriLoader
        .loadModules(
          [
            "esri/map",
            "esri/layers/TileInfo",
            "esri/layers/WebTiledLayer",
            "esri/geometry/Point",
            "dojo/dom",
            "dojo/on",
            "dojo/domReady!"
          ], options
        )
        .then(([
          Map
        ]) => {
          map.centerAt(new esri.geometry.Point({
            "x": row.X,
            "y": row.Y,
            "spatialReference": {
              "wkid": 4490
            }
          }));
          map.setLevel(17);
        })
    },
    /**
     * @constructor addClusters
     * @description 作用：创建点聚集图层
     * @param {Object} resp 点数据
     * */
    addClusters (resp) {
      //获取当前地图
      var map = window.map;
      //在点聚集之前清空放置聚集点的图层(clusters:之前定义的空图层(var layer=new esri.layers.GraphicsLayer({ id: "clusters" });))
      var tempLayer = map.getLayer("clusters");
      if (tempLayer != null) {
        tempLayer.clear();
        map.removeLayer(tempLayer);
      }
      //放置点聚集数据
      var photoInfo = {};
      //点聚集图标需要的图片
      var b_img = this.BluePin1LargeB;
      var g_img = this.GreenPin1LargeB;
      var r_img = this.RedPin1LargeB;
      //arcgis api js文件
      const options =
      {
        url: window.arcjsUrl
      };
      //加载arcgis api css文件
      esriLoader.loadCss(window.arcCssUrl);
      //加载所需arcgis模块
      esriLoader
        .loadModules(
          [
            "dojo/_base/array",
            "esri/geometry/webMercatorUtils",
            "dojo/extras/ClusterLayer",
            "esri/renderers/ClassBreaksRenderer",
            "esri/map",
            "esri/toolbars/draw",
            "esri/layers/WMSLayer",
            "esri/graphic",
            "esri/Color",
            "dojo/dom",
            "dojo/on",
            "esri/tasks/QueryTask",
            "esri/tasks/query",
            "esri/tasks/FindTask",
            "esri/tasks/FindParameters",
            "esri/geometry/Extent",
            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/MarkerSymbol",
            "esri/symbols/SimpleMarkerSymbol",
            "esri/symbols/PictureMarkerSymbol",
            "esri/symbols/PictureFillSymbol",
            "esri/symbols/LineSymbol",
            "esri/layers/FeatureLayer",
            "esri/geometry/Point",
            "esri/graphic",
            "esri/InfoTemplate",
            "esri/InfoWindowBase",
            "esri/layers/GraphicsLayer",
            "esri/dijit/PopupTemplate",
            "esri/geometry/Circle",
            "esri/SpatialReference",
            "esri/renderers/Renderer",
            "esri/renderers/HeatmapRenderer",
            "esri/renderers/UniqueValueRenderer",
            "esri/tasks/FeatureSet",
            "dojo/domReady!"
          ],
          options
        )
        .then(([arrayUtils, webMercatorUtils, ClusterLayer, ClassBreaksRenderer, Map, Point, InfoWindow, FeatureLayer, PictureMarkerSymbol, PictureFillSymbol, GraphicsLayer, graphicsLayer, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, Circle, lineSymbol, Color,
          SpatialReference, FindTask, FindParameters, PopupTemplate, InfoTemplate, Graphic, HeatmapRenderer, UniqueValueRenderer, FeatureSet]) => {
          //数据格式化

          photoInfo.data = arrayUtils.map(resp, function (p) {
            var attributes = {
              "Name": p.Name,
              "Num": p.Num,
              "Note": p.Note
            };
            return {
              "x": p.X,
              "y": p.Y,
              "attributes": attributes
            };
          });
          var infoTemplate = new esri.InfoTemplate(
            '数据信息',
            "<div style='margin-top:5px;'><label>名称:</label></br><div class='map-info-label2' title='${Name}'>${Name}</div></div>" +
            "</div><div style='margin-top:5px;'><label>数值:</label></br><div class='map-info-label2' title='${Num}'>${Num}</div>" +
            "</div><div style='margin-top:5px;'><label>备注:</label></br><div class='map-info-label2' title='${Note}'>${Note}</div></div>"
          )
          //创建点聚集
          var clusterLayer = new ClusterLayer({
            "data": photoInfo.data,
            "distance": 30,    //范围200之内的点聚集
            "id": "clusters",
            "labelColor": "#fff",
            "labelOffset": 10,
            "singleTemplate": infoTemplate    //点弹窗
          });
          //分级渲染
          var defaultSym = new esri.symbol.SimpleMarkerSymbol().setSize(3);
          var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");
          var blue = new esri.symbol.PictureMarkerSymbol(b_img, 32, 32).setOffset(0, 15);
          var green = new esri.symbol.PictureMarkerSymbol(g_img, 64, 64).setOffset(0, 15);
          var red = new esri.symbol.PictureMarkerSymbol(r_img, 72, 72).setOffset(0, 15);
          //按聚集的标注数量分三级(小于等于1聚合图标为蓝色；大于1小于等于50为绿色；大于50为红色)
          renderer.addBreak(0, 1, blue);
          renderer.addBreak(1, 5, green);
          if (resp.length > 5) {
            renderer.addBreak(5, resp.length, red);
          }
          //设置渲染方式  
          clusterLayer.setRenderer(renderer);
          //点聚集图层添加到地图上
          map.addLayer(clusterLayer);
        })
    },
  },
  /*组件生命周期*/
  //this.$el:Vue实例关联的DOM元素
  //this.$data:Vue实例的data选项
  //在实例化初始化(main.js里的new Vue())之后，组件的属性生效之前
  beforeCreate () {
    // console.log("组件创建前")
    // console.log(this.$el)
    // console.log(this.$data)
  },
  //data已初始化，计算属性、event/watch事件回调，但dom树并未挂载(在模板渲染成html前调用，即通常初始化某些属性值，然后再渲染成视图)
  //vue中内置的方法、属性此时已经初始化，它们的生成顺序为props => methods =>data => computed => watch;
  created () {
    // console.log("组件创建完成")
    // console.log(this.$el)
    // console.log(this.$data)
  },
  //在挂载前被调用，render函数(渲染函数)首次被调用生成虚拟dom
  beforeMount () {
    // console.log("挂载前")
    // console.log(this.$el)
    // console.log(this.$data)
  },
  //挂载完成，dom树已经完成渲染到页面，可进行dom操作在模板渲染成html后调用，通常是初始化页面完成后，
  mounted () {
    this.getList()
    // console.log("挂载完成")
    // console.log(this.$el)
    // console.log(this.$data)

    // //set能保证里面的值不重复
    // var arr = [5, 2, '小虎', '小狗', 1, 2, '小狗']
    // var set = new Set()
    // arr.forEach(item => set.add(item));
    // console.log(set)  
    // //map使得如果添加的是已经存在的值，就会覆盖
    // var map=new Map()
    //  arr.forEach(item => map.set(item));
    //  console.log(map)
    
    //var iotData = this.formatedData
  },
  //数据有被更新调用
  beforeUpdate () {
    // console.log("即将更新渲染")
    // let name = this.$refs.app.innerHTML
    // console.log(name)
  },
  //虚拟dom重新渲染布丁以最小dom开支来重新渲染dom
  updated () {
    // console.log("更新成功")
    // let name = this.$refs.app.innerHTML
    // console.log(name)
  },
  //实例销毁之前调用，在这还可以访问实例的数据
  beforeDestroy () {
    var map = window.map;
    var tempLayer = map.getLayer("clusters");
    tempLayer.clear()
    // console.log("销毁前")
    // console.log(this.$el)
    // console.log(this.$data)
  },
  //清除watcher、子组件、事件监听器等
  //组件销毁调用
  destroyed () {
    // console.log("销毁完成")
    // console.log(this.$el)
    // console.log(this.$data)
  }

}
</script>