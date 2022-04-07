<!-- 数据统计 -->
<template>
  <div class="container">
    <div class="chart-container">
      <!-- 上侧工具栏 -->
      <!-- 右侧工具 -->
      <!-- 数据统计柱状图 -->
      <div class="chart-box">
        <!-- 引用LineChart组件 -->
        <DataChart ref="echarts"></DataChart>
      </div>
      <!-- 数据统计表 -->
      <div>
        <el-col>
          <el-button style="float:right"
                     type="primary"
                     size="mini"
                     @click="exportExcel">导出数据表</el-button>
        </el-col>
        <el-col>
        <h3 style="text-align: center;">
            数据统计表
          </h3>
        </el-col>
        <el-table class="chart-table"
                  :data="dataList"
                  :summary-method="getSummaries"
                  show-summary
                  v-loading="listLoading"
                  border
                  stripe
                  size="mini">
          
          <el-table-column label="类别"
                           prop="type"
                           align="center"
                           width="150">
          </el-table-column>
          <el-table-column label="数量"
                           prop="num"
                           align="center"
                           width="100">
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div id="extension"
         style="display: none; background: rgba(0, 0, 0, 0.4)">
    </div>
  </div>
 
</template>

<script>
import DataChart from './DataChart.vue'
import { getAllData } from '../api/api'
export default {
  components: { DataChart },
  data () {
    return {
      activeName: '1',
      listLoading: false,
      AllData: [],
      Data: [],
      Xdata: [],
      Ydata: [],
      XYdata: [],
      Count: 0,
      nameData: '',
      seriesArr: [],
      XLabel: [],
      axisLabel: [],
      dataList: [],
      pieChart: {
        title: '',
        pieData: [],
      },
    }
  },
  creatd(){

  },
  methods: {
    //获取数据列表
    getList () {
      this.listLoading = true
      getAllData().then((res) => {
        this.AllData = res.data.response
        this.listLoading = false
      }).then(() => {
        this.initChart()
      })
    },
    //合计
    getSummaries (param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计';
          return;
        }
        //改变数组中每条数据的内容，不会改变数组长度
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
        } else {
          sums[index] = 'N/A';
        }
      });

      return sums;
    },
    //exportExcel方法，将表格导出为Excel
    exportExcel () {
      require.ensure([], () => {
        const {
          export_json_to_excel,
        } = require('../../src/Excel/Export2Excel') //注意这个Export2Excel路径
        //设置Excel的表格第一行的标题
        const tHeader = [this.nameData, '']
        const tHeader1 = ['类别', '数量']
        const filterVal = ['type', 'num'] // 上面的PWDW是allDataLists里对象的属性key值
        let data = this.dataList
        let result = this.formatJson(filterVal, data) //格式化json字符串
        result.unshift(tHeader1)
        let colConfig = [
          { wch: 30 },
          { wch: 30 }
        ];
        let mergeConfig = [{
          //合并第一行数据[B1,C1,D1,E1]
          s: {//s为开始
            c: 0,//开始列
            r: 0//开始列行
          },
          e: {//e结束
            c: 1,//结束列
            r: 0//结束行
          }
        }];
        export_json_to_excel(
          tHeader,
          result,
          '数据统计(' + this.nameData + ')',
          this.nameData,
          colConfig,
          mergeConfig
        ) //最后一个是表名字
      })
    },
    //格式化json字符串
    formatJson (filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]))
    },
    //echart图
    initChart () {
      let that = this
      let data = this.AllData
      //把你所需要数据赋值给data中的pieChart对象，然后获取对象中的键值
      this.pieChart.title = '按数据数量值统计'
      this.pieChart.pieData = data
      let pieData = this.pieChart
      var Data = this.pieChart.pieData
      if (Data && Data.length) {
        this.Data = []
        this.Xdata = []
        this.Ydata = []
        this.XYdata = []
        this.Count = 0
        this.nameData = pieData.title
        var result = []
        var num1 = 0
        var num2 = 0
        var num3 = 0
        var num4 = 0
        var num5 = 0
        var num6 = 0
        var num7 = 0
        for (var i = 0; i < Data.length; i++) {
          let num = Data[i].Num
          if (num == null || num == '') {
            num1 += 1
          } else if (num < 10) {
            num2 += 1
          } else if (num >= 10 && num < 20) {
            num3 += 1
          } else if (num >= 20 && num < 30) {
            num4 += 1
          } else if (num >= 30 && num < 40) {
            num5 += 1
          } else if (num >= 40 && num < 50) {
            num6 += 1
          } else if (num >= 50) {
            num7 += 1
          }
        }
        result = {}
        this.Xdata.push(
          '无值',
          '10以下',
          '10-20',
          '20-30',
          '30-40',
          '40-50',
          '50以上'
        )
        this.Ydata.push(num1, num2, num3, num4, num5, num6, num7)
        this.seriesArr = [] //series
        this.XLabel = [] //x轴数据
        this.nameData = this.nameData
        this.axisLabel = { interval: 0 }
        for (var i = 0; i < this.Xdata.length; i++) {
          this.XLabel.push(this.Xdata[i])
          let obj = {}
          obj.name = this.Xdata[i]
          obj.type = 'bar'
          obj.barWidth = 10
          obj.stack = '数量'
          obj.data = []

          for (var j = 0; j <= i; j++) {
            if (i != j) {
              obj.data.push(0)
            } else {
              obj.data.push(this.Ydata[i])
            }
          }
          this.seriesArr.push(obj)
        }
        this.dataList = []
        for (let i = 0; i < this.seriesArr.length; i++) {
          this.dataList.push({
            type: this.seriesArr[i].name,
            num: this.seriesArr[i].data[i],
          })
        }
        this.$refs.echarts.initChart(
          this.seriesArr,
          this.XLabel,
          this.axisLabel,
          data.length,
        )
      }
    },
    formatEllipsis (str = '', limitLen = 11) {
      let len = 0,
        reg = /[\x00-\xff]/, //半角字符的正则匹配
        strs = str.split(''),
        inx = strs.findIndex((s) => {
          len += reg.test(s) ? 1 : 2
          if (len > limitLen) return true
        })
      return inx === -1 ? str : str.substr(0, inx) + '...'
    },
    //去除数组中TAGNAME相同的重复项
    trans: function (arr) {
      var result = []
      for (var i = 0; i < arr.length; i++) {
        var value = arr[i].TAGID
        var arrOld = arr.concat([])
        for (var j = arr.length - 1; j > i; j--) {
          if (arr[i].TAGNAME == arr[j].TAGNAME) {
            value = arr[j].TAGID
            arrOld.splice(j, 1)
          }
        }
        arr = arrOld
        result.push({
          label: arr[i].TAGNAME,
          value: value,
        })
      }
      return result
    },
    //trans2方法：将name值相同的value值相加，组成新的对象
    trans2: function (arr) {
      var result = []
      for (var i = 0; i < arr.length; i++) {
        var sum = arr[i].value
        var arrOld = arr.concat([])
        for (var j = arr.length - 1; j > i; j--) {
          if (arr[i].name == arr[j].name) {
            sum += arr[j].value
            arrOld.splice(j, 1)
          }
        }
        arr = arrOld
        if (arr[i].name) {
          result.push({
            name: arr[i].name,
            value: sum,
          })
        } else {
          result.push({
            name: '其他',
            value: sum,
          })
        }
      }
      return result
    },
  },
  mounted () {
    //非父子组件之间传值，采用总线机制，或者叫做Bus/发布订阅模式/观察者模式
    //发布
    this.$bus.$emit('DST-to-Map', "我是DataStatistical里的值（我们不是父子组件）") //发射组件A的数据
    //数据初始化
    this.getList()
  },
}
</script>

<style scoped>
.container {
  width: 100%;
  padding: 15px;
  box-sizing: border-box;
}
.chart-container {
  width: 100%;
  display: flex;
  justify-items: center;
  flex-direction: row;
}
.chart-box {
  flex-basis: 600px;
  flex: 1;
  width: 600px;
  height: 300px;
  margin-top: 30px;
}
.chart-table {
  flex-basis: 200px;
  margin-top: 40px;
}
.warningtext {
  color: red;
  font-size: 14px;
  margin: 5px;
}
.collapse-header {
  position: relative;
  padding-left: 20px;
  font-size: 18px;
  color: rgb(58, 142, 230);
  width: 100%;
}
.collapse-header::before {
  content: " ";
  position: absolute;
  left: 0px;
  height: 32px;
  margin: 6px;
  background-color: #084f90;
  width: 10px;
}
.deploy-set .el-collapse-item__header {
  border-bottom: 1px solid #2c8df4;
  text-align: center;
  color: #2c8df4;
  font-size: large;
}
/* .deploy-setting .el-collapse-item__wrap {
  background-color: #ebeef5;
} */
</style>
