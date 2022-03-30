//入口文件
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/*引入vue框架*/
import Vue from 'vue'

/*引入根组件*/   
import App from './App'  
import store from './store'
/*引入路由设置*/
import router from './router' 
import ElementUI from 'element-ui'
import enLocale from 'element-ui/lib/locale/lang/en' //英文
import zhLocale from 'element-ui/lib/locale/lang/zh-CN' //中文
import 'element-ui/lib/theme-chalk/index.css'
import layer from '../src/components/layer/layer.js'
import './style/blue.css'
import '../src/directive/drag'
import esriLoader from 'esri-loader'
import MAP from '../config/config'
import bus from '../util/bus.js'
import earth from "./js/CesiumEarth.js";
// import "../src/js/lib/aliplayer-2.9.3/aliplayer-h5-min.js"
// import "../src/js/lib/aliplayer-2.9.3/aliplayer-hls-min.js"


/**
 * true:开发模式；false:生产模式
 * 开发环境下，Vue 会提供很多警告来帮你对付常见的错误与陷阱。
 * 而在生产环境下，这些警告语句却没有用，反而会增加应用的体积。
 * 此外，有些警告检查还有一些小的运行时开销，这在生产环境模式下是可以避免的
 */
Vue.config.productionTip = false;
//调用ElementUI（zhLocale中文模式）
Vue.use(
  ElementUI,
  { zhLocale },
);
//调用esriLoader组件
Vue.use(esriLoader);
//全局变量$layer（弹窗）（Vue.prototype实际上是为Vue对象添加了一个原型属性，而不是一个全局变量。但是如果这个原型属性的值是引用类型的，我们就可以借此实现全局变量）
Vue.prototype.$layer = layer(Vue);
//全局变量validSe_SQL（禁止特殊字符输入(防SQL注入)）
Vue.prototype.validSe_SQL = function (value, number = 255) {
  value = value.replace(/from|select|update|and|or|delete|insert|trancate|char|into|substr|ascii|declare|exec|count|master|into|drop|execute/i, '');
  if (value.length >= number) {
    this.$message({
      type: "warning",
      message: `输入内容不能超过${number}个字符`
    });
  }
  return value;
};
Vue.prototype.$bus = new Vue ()  

Vue.prototype.Earth = earth;
//全局注册一个组件（要在初始化根实例之前注册组件）
Vue.component('my-component', {
  template: '<div>我是全局组件</div>'
})
/*初始化vue根实例*/
new Vue({
  router,    //将router实例挂载到vue根实例上。在组件中就可以使用$router访问到router实例了
  store,
  bus,       //将bus挂载到vue根实例上，用于非父子组件传值
  render: (h) => h(App),
}).$mount('#app')

