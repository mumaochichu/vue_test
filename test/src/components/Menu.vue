<!--导航菜单-->
<template>
  <div>
    <el-menu @select="handleSelect"
             background-color="#1f5f9a"
             text-color="#fff"
             active-text-color="#ffd04b"
             mode="horizontal">
      <template v-for="item in NavigateItem">
        <!-- v-if条件渲染：如果出事渲染条件为假，则什么也不做，直到条件第一次变为真时，才会开始渲染条件块 -->
        <!-- v-show:不管初始条件是什么，元素总是会被渲染，并且只是简单地基于CSS的"display"属性进行切换 -->
        <!-- v-if 指令开销较大，所以更适合条件不经常改变的场景。而 v-show 指令适合条件频繁切换的场景 -->
        <el-submenu v-if="item.items.length"
                    :index="item.key"
                    :key="item.key">
          <template slot="title">
            <img :src="require('../assets/images/'+item.icon+'.png')"
                 :alt="item.title" />
            {{ item.title }}
          </template>
          <el-menu-item v-for="(items, key) in item.items"
                        :key="key"
                        :index="items.key">
            {{ items.title }}
          </el-menu-item>
        </el-submenu>
        <el-menu-item v-else
                      :index="item.key"
                      :key="item.key">
          {{ item.title }}
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
import MapQuery from '../views/MapQuery.vue'
import ThematicMap from '../views/ThematicMap.vue'
import DataManagement from '../views/DataManagement.vue'
import DataStatistical from '../views/DataStatistical.vue'
import DataMonitor from '../views/DataMonitor.vue'
import BusinessLog from '../views/BusinessLog.vue'
import { getMenu, getData } from '../api/api'
export default {
  data () {
    return {
      activeIndex: 1,
      menuList: [],
      NavigateItem: [],
      selfContent: this.content,
      msg: "我是子组件Menu里的值"
    };
  },
  props: {
    p_data: {
      type: String,
      default: '',
    },
    content: String,
  },
  //data已初始化，计算属性、event/watch事件回调，但dom树并未挂载(在模板渲染成html前调用，即通常初始化某些属性值，然后再渲染成视图)
  created () {
    this.getMenuList();
    //子组件通过events传值给父组件(childValue:父组件定义的函数；子组件的值:要传给父组件的值)
    //this.$emit('childValue', "子组件的值")
  },
  //挂载完成，dom树已经完成渲染到页面，可进行dom操作在模板渲染成html后调用，通常是初始化页面完成后，再对html的dom节点进行一些需要的操作
  mounted () {
    /**
     * Promise.all获得的成功结果的数组里面的数据顺序和Promise.all接收到的数组顺序是一致的，
     * 即p1的结果在前，即便p1的结果获取的比p2要晚。
     * 这带来了一个绝大的好处：在前端开发请求数据的过程中，偶尔会遇到发送多个请求并根据请求顺序获取和使用数据的场景，
     * 使用Promise.all毫无疑问可以解决这个问题
     */
    //  Promise.all([getMenu(), getData()]).then((res) => {
    //   console.log(res[0])
    //   console.log(res[1].data.response.data)
    // })
    //父子组件传值
    //child: 是父组件指定的传数据绑定的函数，this.msg:子组件给父组件传递的数据
    //this.$emit('child',this.msg)
    //props接收父组件绑定的值
    //console.log(this.p_data)
  },
  methods: {
    //菜单激活
    handleSelect (key) {
      switch (key) {
        case "1001":
          this.$layer.iframe({
            content: {
              content: MapQuery,
              parent: this,
            },
            area: ["550px", "570px"],
            title: "地图查询",
            maxmin: true,
            shade: false,
            shadeClose: false,
            resize: true,
            cancel: () => {
              //关闭事件
              this.$layer.close(this.layerid);
            },
          });
          break;
        case "1002":
          this.$layer.iframe({
            content: {
              content: ThematicMap,
              parent: this,
            },
            area: ["550px", "570px"],
            title: "专题图",
            maxmin: true,
            shade: false,
            shadeClose: false,
            resize: true,
            cancel: () => {
              //关闭事件
              this.$layer.close(this.layerid);
            },
          });
          break;
        case "2001":
          this.$layer.iframe({
            content: {
              content: DataManagement,
              parent: this,
            },
            area: ["900px", "615px"],
            title: "数据管理",
            maxmin: true,
            shade: false,
            shadeClose: false,
            resize: true,
            cancel: () => {
              //关闭事件
              this.$layer.close(this.layerid);
            },
          });
          break;
        case "2002":
          this.$layer.iframe({
            content: {
              content: DataStatistical,
              parent: this,
            },
            area: ["800px", "500px"],
            title: "数据统计",
            maxmin: true,
            shade: false,
            shadeClose: false,
            resize: true,
            cancel: () => {
              //关闭事件
              this.$layer.close(this.layerid);
            },
          });
          break;
        case "2003":
          this.$layer.iframe({
            content: {
              content: DataMonitor,
              parent: this,
            },
            area: ["800px", "500px"],
            title: "视频监控",
            maxmin: true,
            shade: false,
            shadeClose: false,
            resize: true,
            cancel: () => {
              //关闭事件
              this.$layer.close(this.layerid);
            },
          });
          break;
        case "3001":
          this.$layer.iframe({
            content: {
              content: BusinessLog,
              parent: this,
            },
            area: ["550px", "570px"],
            title: "业务日志",
            maxmin: true,
            shade: false,
            shadeClose: false,
            resize: true,
            cancel: () => {
              //关闭事件
              this.$layer.close(this.layerid);
            },
          });
          break;
        default:
          break;
      }

    },
    async getMenuList () {
      let res = await getMenu()
      //这就是我们后台传过来的菜单栏信息
      this.menuList = res.data.response.Result
      //将菜单的父菜单和子菜单分开
      this.menuList.forEach((item, index) => {
        if (item["P_id"] == -1) {
          this.NavigateItem.push({
            title: item["Name"],
            key: item["Id"],
            path: item["Url"],
            icon: item["Icon"],
            items: [],
          })
        }
        else {
          this.NavigateItem[item["P_id"] - 1].items.push({
            title: item["Name"],
            key: item["Id"],
            path: item["Url"],
            icon: item["Icon"],
          })
        }
      })
    }
  },
};
</script>
<style scoped>
.el-row {
  width: 200px;
}
</style>