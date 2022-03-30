<!--自定义Echart折线图组件(水质实时)-->
<template>
  <div :class="className"
       :id="chart"
       :style="{width: '450px', height: '300px'}"></div>
</template>

<script>
import echarts from 'echarts';
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
      legendData: [],
      chart: null,

    };
  },
  beforeDestroy () {
    if (!this.chart) {
      return
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    initChart (radius, pieData, pieDataName) {
      //基于准备好的dom，初始化echarts实例
      let chart = echarts.init(this.$el, 'macarons');
      //y轴
      //这里定义折线,用于图表
      var ydata =
        [{
          name: pieData.Name,
          //line为折线类型
          type: 'line',
          data: [],
        },
        ];
      //x轴
      //定义数组
      var xdata = new Array();
      var arrtitle = [pieData.Name];//标题
      var now = new Date();//获取当前时间
      xdata.push(now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
      //开始模拟实时数据
      start()
      //图表停止
      function stop () {
        clearInterval(dt);
      }
      //图表开始
      function start () {
        dt = setInterval(function () {
          //为x值数组赋值
          var now = new Date();
          xdata.push(now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
          //当x值数组长度大于5就去除数组中第一个数组
          if (xdata.length > 5) {
            xdata.shift();
          }
          //为y值数组赋值
          for (var i = 0; i < arrtitle.length; i++) {

            if (ydata[i].name == pieData.Name) {
              ydata[i].data.push(pieData.Num + Math.random() * 100);
            }
          }
          //当y值数组长度大于5就去除数组中第一个元素
          if (ydata[0].data.length > 5) {
            ydata[0].data.shift();
          }
          //日期文本
          var dateText = now.getFullYear() + "年" + (now.getMonth() + 1) + "月" + now.getDate() + "日";
          //渲染
          chart.setOption({
            //标题组件
            title: [
              //第一个标题
              {
                left: '10%',
                top: '5%',
                textStyle: {
                  fontSize: 10
                },
                text: pieData.Name
              },
              //日期标题
              {
                top: '0%',
                left: '80%',
                textStyle: {
                  fontSize: 10
                },
                text: dateText
              }
            ],
            //鼠标提示
            tooltip: {
              trigger: 'axis',
              formatter: function (params) {
                return params[0].value
              },
              axisPointer: {
                animation: false
              }
            },
            //工具栏
            toolbox: {
              show: true,
              feature: {
                //数据视图
                dataView: { readOnly: false },
                //保存为图片
                saveAsImage: {}
              },
              top: '5%',
              left: '80%',
            },
            //图例
            legend: {
              data: [pieData.Name]
            },
            //x轴
            xAxis: [
              {
                type: 'category',
                boundaryGap: false,
                data: xdata
              },
            ],
            //y轴
            yAxis: [
              {
                type: 'value',
                data: ydata,
                boundaryGap: true,
              },
            ],
            //直角坐标系内绘图网格，单个 grid 内最多可以放置上下两个 X 轴，左右两个 Y 轴
            grid: [{
              bottom: '60%'
            }, {
              top: '60%'
            }],
            //系列列表。每个系列通过 type 决定自己的图表类型
            series:
              [{
                type: ydata[0].type,
                data: ydata[0].data,
                name: ydata[0].name
              },
              ],
          });
        }, 1000);

      }
      //周期函数，周期为1秒
      var dt = setInterval(function () {
        //为x值数组赋值
        var now = new Date();
        xdata.push(now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
        //当x值数组长度大于5就去除数组中第一个数组
        if (xdata.length > 5) {
          xdata.shift();
        }
        //为y值数组赋值
        for (var i = 0; i < arrtitle.length; i++) {

          if (ydata[i].name == pieData.Name) {
            ydata[i].data.push(pieData.Num+ Math.random() * 100);     //(+ + Math.random() * 100)
          }
        }
        //当y值数组长度大于5就去除数组中第一个元素
        if (ydata[0].data.length > 5) {
          ydata[0].data.shift();
        }
        //日期文本
        var dateText = now.getFullYear() + "年" + (now.getMonth() + 1) + "月" + now.getDate() + "日";
        //渲染
        chart.setOption({
          //标题组件
          title: [
            //第一个标题
            {
              left: '10%',
              top: '5%',
              textStyle: {
                fontSize: 10
              },
              text: pieData.Name
            },
            //日期标题
            {
              top: '0%',
              left: '80%',
              textStyle: {
                fontSize: 10
              },
              text: dateText
            }
          ],
          //鼠标提示
          tooltip: {
            trigger: 'axis',
          },
          //工具栏
          toolbox: {
            show: true,
            feature: {
              //数据视图
              dataView: { readOnly: false },
              //保存为图片
              saveAsImage: {}
            },
            top: '5%',
            left: '80%',
          },
          //图例
          legend: {
            data: [pieData.Name]
          },
          //x轴
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: xdata
            },
          ],
          //y轴
          yAxis: [
            {
              type: 'value',
              data: ydata,
              boundaryGap: true,
            },
          ],
          //直角坐标系内绘图网格，单个 grid 内最多可以放置上下两个 X 轴，左右两个 Y 轴
          grid: [{
            bottom: '10%'
          }, {
            top: '10%'
          }],
          //系列列表。每个系列通过 type 决定自己的图表类型
          series:
            [
              //监测项1
              {
                type: ydata[0].type,
                data: ydata[0].data,
                name: ydata[0].name,
                symbolSize: 10,
                markLine: {
                  symbol: ['none', 'arrow'], //['none']表示是一条横线；['arrow', 'none']表示线的左边是箭头，右边没右箭头；['none','arrow']表示线的左边没有箭头，右边有箭头
                  label: {
                    position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end" 开始 中点 结束
                    formatter: '警戒值'
                  },
                }
              },
            ],
        });
      }, 1000);
    },
  }
}
</script>
