<template>
  <section style="overflow: hidden; height: 100%;">
    <span ref="app">{{name}}</span>
    <!--查询与新增-->
      <!-- style="float: right; height: 10%;margin-top: 1%;" -->
    <el-form :inline="true"      
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
              style="width: 100%;">
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
    </el-table>
       <div style="margin: auto; padding-left: 60px; width: 350px">
              <el-button @click="endMove"
                         :disabled="endState">暂停</el-button>
              <el-button @click="startMove"
                         :disabled="startState">开始</el-button>
              <el-slider v-model="speed"
                         style="float: right"></el-slider>
              <span class="speed"
                    style="float: right; padding: 12px 0">速度：</span>
            </div>
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
import carImage from '../assets/images/car.png'
import format from '../date.js'
import {
  movementInit
} from "../../util/Tra_movement_alarm.js";
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
      speed:0,
       endState: true,
      startState: false,
      carImage:carImage,
    }
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
      this.allList = data
      this.tableList = data_p.data
      //console.table(JSON.parse(JSON.stringify(this.tableList)))
      this.total = data_p.dataCount
      this.page = data_p.page
      this.pageSize = data_p.PageSize
      this.listLoading = false
        that.startState = false;
        that.endState = true;
        window.isPos = false;
        window.start = 0;
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
    //产生十个随机经纬度点坐标
    randomLonandLat () {
      var arr_jwd = [];
      for (var i = 0; i < 10; i++) {
        var array_jdwd = [];
        //经度
        var lon = Math.random().toFixed(3) * (117.158 - 117.092) + 117.092;
        //纬度
        var lat = Math.random().toFixed(3) * (36.673 - 36.644) + 36.644;
        array_jdwd.push(lon);
        array_jdwd.push(lat);
        arr_jwd.push(array_jdwd);
      }
      return arr_jwd;
    },
    //开始轨迹移动
    startMove () {
      window.speed = this.speed > 0 ? 100 / this.speed : 100;
      this.startState = true;
      this.endState = false;
      window.isPos = true;
      let map = window.map;
      let carspeed = 10;
      let points0 = this.points;
      var carattr = [carImage, 20, 35];
      var color0 = [0, 255, 0];
      //由开始开始的移动
      if (window.start == 0||this.this.randomLonandLat().length) {
        this.guijiMap();
      }
      //由暂停开始的移动
      else {
        movementInit(map, points0, carspeed, carattr, color0);
      }

    },
    //暂停轨迹移动
    endMove () {
      this.startState = false;
      this.endState = true;
      window.isPos = false;
    },
    //回放轨迹方法
    guijiMap (val) {
      const options = {
        url: "https://js.arcgis.com/3.18/",
      };
      //加载arcgis api css文件
      esriLoader.loadCss("https://js.arcgis.com/3.18/esri/css/esri.css");
      //加载所需arcgis模块
      esriLoader
        .loadModules([
          "esri/map",
          "esri/layers/GraphicsLayer",
          "esri/geometry/Extent",
          "dojo/domReady!",
        ])
        .then(([Map, GraphicsLayer, Extent]) => {
          let map = window.map;
          var carspeed = this.speed > 0 ? 100 / this.speed : 100;
          //var carspeed=50000
          var points0 = JSON.parse(JSON.stringify(this.randomLonandLat()));
          this.points = points0;
          var carattr = [carImage, 20, 35];
          var color0 = [0, 255, 0];
          movementInit(map, points0, carspeed, carattr, color0);
        });
    },

  },

  //挂载完成，dom树已经完成渲染到页面，可进行dom操作在模板渲染成html后调用，通常是初始化页面完成后，
  mounted () {
    this.getList()
  },

  //实例销毁之前调用，在这还可以访问实例的数据
  beforeDestroy () {

  },

}
</script>
<style>
.serchFrom{
  display: flex;                /*采用flex布局 */
  flex-direction: row;          /*主轴方向（即项目排列方向）。值有row（主轴为水平方向，起点在左端）、row-reverse（主轴为水平方向，起点在右端）、column(主轴为垂直方向，起点在上沿)、column-reverse（主轴为垂直方向，起点在下沿）*/
  flex-wrap:nowrap;             /*定义项目在一条轴线上排不下如何换行。值有nowrap（不换行）、wrap（换行，第一行在上方）、wrap-reverse（换行，第一行在下方）*/
  justify-content: flex-end;    /*定义项目在主轴上的对齐方式。值有flex-start（左对齐）、flex-end（右对齐）、center（居中）、space-betwen（两端对齐，项目之间的间隔都相等）、space-around（每个项目两侧的间隔相等）*/   
}
</style>