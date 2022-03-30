<!--主页-->
<template>
  <div class="home">
    <!-- @为v-on:的简写，用来绑定事件(value函数) -->
    <!-- :为v-bind的缩写，用来绑定数据  @childValue="value" -->
    <Menu @child="getValue"
          :p_data="data"></Menu>
    <div class="header_logout">
      <LogoutPartial />
    </div>
    <router-view></router-view>
    <!-- <initPage ref="initPage"></initPage> -->
  </div>
</template>

<script>
import { getData, getAllData } from '../api/api'
import { mapMutations } from 'vuex'
import { localSocket } from '../../util/websoket';
import Menu from './Menu.vue'    //引入导航菜单组件
import mapView from './Map.vue'  //地图组件
import LogoutPartial from './LogoutPartial.vue'    //退出登录组件
import ToolsView from './tool.vue'     //地图工具组件
export default {
  data () {
    return {
      data: "我是父组件Home里的值",
    };
  },
  //局部注册组件（先引入后再components里注册）
  components: {
    Menu,
    mapView,
    LogoutPartial,
    ToolsView
  },
  methods: {
    ...mapMutations(['setIOTData']),
    iot_data_get () {
      getAllData().then((res) => {
        this.setIOTData(res.data.response);
        localSocket();
      });
    },
    //父组件接收子组件的值(val即从子组件传递过来的值)
    getValue (val) {
      console.log(val)
    },
    //递归深拷贝函数
    copy (obj) {
      let newObj = null; // 声明一个对象来存储拷贝之后的内容
      // 判断数据类型是否是复杂的数据类型，如果是则调用自己，如果不是则直接赋值即可！
      // 由于null不可以循环但是他的类型又是object，所以这个需要对null进行判断
      if (typeof (obj) == 'object' && obj !== null) {
        // 声明一个变量用以存储拷贝出来的值，根据参数的具体数据类型声明不同的类型来存储
        newObj = obj instanceof Array ? [] : {};
        // 循环obj的每一项，如果里面还有复杂的数据类型的话，则直接利用递归函数再次调用。
        for (let i in obj) {
          newObj[i] = this.copy(obj[i])
        }
      } else {
        newObj = obj
      }
      return newObj; // 函数没有返回的值的话，则为undefined
    }
  },
  mounted () {
    // getAllData().then((res) => {
    //   console.log(res)
    // })
    // if (true) {
    //   var a = 123
    //   let b = 456
    //   const c = 789
    // }
    // if (true) {
    //   console.log(a)
    //   //console.log(b)
    //   //console.log(c)
    // }
    // var sum = 0;
    // for (var i = 0; i <= 10; i++) {    
    //   sum += i
    // }
    // console.log(i)
    // console.log(sum)
    // //JS中去除数组中的重复元素
    // var arr = [1, 2, 3, 1, 2, 5, 6, 8]
    // //声明一个空数组
    // var empty = []
    // //循环arr数组中的元素
    // for (let i = 0; i < arr.length; i++) {
    //   //indexOf()方法如果要检索的字符串没有出现，则返回-1
    //   //判断empty数组中是否含有arr数组中的第i个元素，小于0就是没有
    //   //如果没有就把这个元素加到empty数组中
    //   if (empty.indexOf(arr[i]) < 0) {
    //     empty.push(arr[i])    //push()项数组末尾添加元素
    //   }
    // }
    // arr = empty    //把数组arr赋值为empty
    // console.log(window.location.search)  //获取地址传递的参数
    //浅拷贝与深拷贝
    // let a = {
    //   age: 18,
    //   name: 'a',
    //   address: {
    //     city: 'beijing',
    //     county: 'china'
    //   },
    //   arr: ['s', 'k', 'b'],
    //   add:function(){
    //     console.log('a')
    //   }
    // }
    // //浅拷贝
    // let b = a
    // //深拷贝1：JSON对象(不能拷贝function)
    // let c = JSON.parse(JSON.stringify(a))
    // //深拷贝2：Object.assign(target,source)(如果只有一级属性，就是深拷贝)
    // let d = Object.assign([], a)
    // //深拷贝3：递归拷贝
    // let e = this.copy(a); // 声明一个对象来存储拷贝之后的内容 
    // a.name="aaa"
    // a.arr[0]='a'
    // console.log(b)
    // console.log(c)
    // console.log(d)
    // console.log(e)
    
    this.iot_data_get()

  }
}
</script>

<!-- 添加"scoped"限制CSS只在本组件内起作用 -->
<style scoped>
.header {
  margin: 0;
  height: 85px;
  width: 100%;
  position: fixed;
  z-index: 10;
}
.header_logout {
  left: 0;
}
.home,
main {
  height: 100%;
}
.main,
.header_menu {
  position: relative;
}
footer {
  text-align: center;
  position: absolute;
  bottom: 10px;
  left: 10px;
}
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
