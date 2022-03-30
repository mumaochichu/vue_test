<!--数据统计页面图表组件-->
<template>
  <!-- 放置图表的DOM -->
  <div :id="className"
       :style="{width: '500px', height: '300px'}">
  </div>
</template>

<script>
import echarts from 'echarts';
import $ from 'jquery';
require('echarts/theme/macarons'); // echarts 主题

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
  },
  data () {
    return {
      Data: [],
      chart: null,
      XLabel: [],
      seriesArr: [],
      obj: {},
      axisLabel: {},
      Xdata: [],  //x轴数据
      Ydata: [],  //y轴数据
      nameData: [],  //标题数据
      Count: 0,
      units: '',
    };
  },
  beforeDestroy () {
    if (!this.chart) {
      return
    }
    this.chart.dispose();
    this.chart = null;
    this.Xdata = [];
    this.Ydata = [];
    this.XYdata = [];
  },
  methods: {
    //pieData,从HistoryData.vue传过来的数据
    initChart (pieData, XLabel, axisLabel, count) {
      this.XLabel = XLabel;
      this.axisLabel = axisLabel;
      this.pieData = pieData;
      this.count = count;
      //获取DOM
      let chart = echarts.init(this.$el, 'macarons');
      this.chart = chart;
      chart.setOption(this.setOption(count), true);
      extension(chart);
      function extension (chart) {
        //X轴数据鼠标悬浮显示全部
        chart.on('mouseover', function (params) {
          if (params.componentType == "xAxis") {
            $('#extension').css({
              "position": "absolute",
              "color": "white",
              //"border":"solid 2px white",
              "font-family": "Arial",
              "font-size": "15px",
              "padding": "5px",
              "display": "inline"
            }).text(params.value);
            $("html").mousemove(function (event) {
              //console.log(document.getElementsByClassName('vl-notify vl-notify-main vl-notify-alert vl-notify-iframe')[0].style.width)
              var xx = event.pageX - 200;
              var yy = event.pageY - 100;
              $('#extension').css('top', yy).css('left', xx);
            });
          }
        });
        chart.on('mouseout', function (params) {
          if (params.componentType == "xAxis") {
            $('#extension').css('display', 'none');
          }
        });
      };
    },
    //图表配置项和数据
    setOption (count) {
      let title = '数据统计柱状图'
      //指定图表的配置项和数据
      var option = {
        //标题
        title: {
          text: title,
          top: '10%',
          left: '20%'
        },
        //图表位置
        grid: {
          left: 50,
          right: 130,
          height: '70%'
        },
        //图例
        legend: {
          type: 'scroll',
          orient: 'vertical',
          y: 'center',    //延Y轴居中
          x: 'right', //居右显示
          data: this.XLabel,
          tooltip: {
            show: true
          },
          align: 'left',
          selected: this.XLabel.selected,
          formatter: function (name) {
            return name.length > 10 ? name.substr(0, 10) + "..." : name;
          }
        },
        //提示框
        tooltip: {
          trigger: 'axis', //触发类型，axis为坐标轴触发，主要在柱状图，折线图等会使用类目轴的图表中使用
          axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'| 'none'
          },
          //自定义提示框内容
          formatter: function (params) {
            return ("类型：" + params[0].name + "</br>" + "数量：" + params[0].value + "</br>" + "占比：" + (params[0].value / count * 100).toFixed(2) + "%")
          }
        },
        //工具栏
        toolbox: {
          show: true,
          right: '30%',
          feature: {
            // dataZoom: {
            //   yAxisIndex: 'none'
            // },
            //dataView: { readOnly: false },
            //magicType: { type: ['line', 'bar'] },
            //restore: {},
            saveAsImage: {
              type: 'png',
              name: title || "数据统计"
            },
            // myEnlarge: {//自定义按钮必须以my开头
            //   show: true,
            //   title: '数据视图',
            //   icon: 'path://M432.45,595.444c0,2.177-4.661,6.82-11.305,6.82c-6.475,0-11.306-4.567-11.306-6.82s4.852-6.812,11.306-6.812C427.841,588.632,432.452,593.191,432.45,595.444L432.45,595.444z M421.155,589.876c-3.009,0-5.448,2.495-5.448,5.572s2.439,5.572,5.448,5.572c3.01,0,5.449-2.495,5.449-5.572C426.604,592.371,424.165,589.876,421.155,589.876L421.155,589.876z M421.146,591.891c-1.916,0-3.47,1.589-3.47,3.549c0,1.959,1.554,3.548,3.47,3.548s3.469-1.589,3.469-3.548C424.614,593.479,423.062,591.891,421.146,591.891L421.146,591.891zM421.146,591.891',
            //   onclick: function () {
            //     console.log(this.chart)
            //   }
            // }

          }
        },
        //x轴
        xAxis: {
          name: '类别',
          triggerEvent: true,
          type: 'category',
          splitLine: {
            show: false
          },
          axisLabel: this.axisLabel,
          data: this.XLabel,
        },
        //y轴
        yAxis: {
          type: 'value',
          name: '数量:条',
          boundaryGap: [0, '100%'],
          splitLine: {
            show: false
          },
          // axisLabel: {
          //   formatter: '{value} %'
          // }
        },
        //系列列表,每个系列通过 type 决定自己的图表类型
        series: this.pieData,
      }
      return option
    }
  },
  mounted(){
  }
}
</script>
<style lang="css">
.tipname {
  position: absolute;
  background: rgba(0, 0, 0, 0.5);
  /* border-radius: 5px;
  max-width: 400px;
  padding: 5px; */
  z-index: 1;
  color: #fff;
}
</style>