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
          text: title,    //主标题文本
          //subtext:title,  //副标题文本
          show:true,      //是否显示标题组件
          textStyle:{     //主标题文本样式
          },
          //标题位置
          top: '10%',
          left: '20%'
        },
        //图表
        grid: {
          left: 50,
          right: 130,
          height: '70%'
        },
        //图例
        legend: {
          type: 'scroll',     //图例类型。plain：普通图例。scroll：可滚动翻页图例
          orient: 'vertical', //图例列表布局朝向。horizontal：水平。vertical：垂直。
          y: 'center',    //延Y轴居中
          x: 'right',     //居右显示
          data: this.XLabel,  //图例的数据数组
          tooltip: {          //提示框
            show: true      
          },
          align: 'left',      //图例标记和文本的对齐
          selected: this.XLabel.selected,    //图例选中状态表
          formatter: function (name) {       //格式化图例文本
            return name.length > 10 ? name.substr(0, 10) + "..." : name;
          }
        },
        //提示框
        tooltip: {
          trigger: 'axis',         //触发类型，axis为坐标轴触发，主要在柱状图，折线图等会使用类目轴的图表中使用
          axisPointer: {           // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'         // 默认为直线，可选为：'line' | 'shadow'| 'none'
          },
          //自定义提示框内容
          formatter: function (params) {
            return ("<table  border='1' cellspacing='0'>"+"<tr><th style='color:rgb(31, 95, 154)'>类型：</th>" +"<th>"+ params[0].name + "</th></tr>" +
             "<tr><th style='color:rgb(31, 95, 154)'>数量：</th>" +"<th>"+ params[0].value + "</th></tr>" + 
             "<tr><th style='color:rgb(31, 95, 154)'>占比：</th>" +"<th>"+ (params[0].value / count * 100).toFixed(2) + "%"+"</th></tr></table>")
          }
        },
        //工具栏
        toolbox: {
          show: true,
          right: '30%',
          feature: {
            magicType: { type: ['line', 'bar'] },  //折线图/柱状图
            saveAsImage: {              //保存为图片
              type: 'png',
              name: title || "数据统计"
            },
          }
        },
        //x轴
        xAxis: {
          name: '类别',
          triggerEvent: true,  //坐标轴标签是否触发鼠标事件
          type: 'category',
          splitLine: {
            show: false        //是否显示分割线
          },
          axisLabel: this.axisLabel,
          data: this.XLabel,     //x轴数据
        },
        //y轴
        yAxis: {
          type: 'value',
          name: '数量:条',
          boundaryGap: [0, '100%'],
          splitLine: {
            show: false
          },
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