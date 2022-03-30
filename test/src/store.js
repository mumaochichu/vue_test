import Vue from 'vue'
import Vuex from 'vuex'
import Cookies from 'js-cookie'


/**
 * vuex的方案是，在vue中构建一个用于存储state、定义操作state方法的仓库（即store）。
 * 通过在多个（不一定是全部）组件中引用需要的state、调用“操作state的方法”来实现对给共享变量的处理。
 * 且由于各个组件对state是引用的，单个组件改变了某个state后，其他组件可以实时的响应变化。
 * */
/**
 *    vuex的工作流程

    1.在vue组件里面，通过dispatch来触发actions提交修改数据的操作。

    2.然后再通过actions的commit来触发mutations来修改数据。

    3.mutations接收到commit的请求，就会自动通过Mutate来修改state（数据中心里面的数据状态）里面的数据。

    4.最后由store触发每一个调用它的组件的更新

 */
/**
 * vuex和全局变量的区别
 * （1）vuex用于做状态管理，主要是应用于vue.js中管理数据状态的一个库，通过创建一个集中的数据存储，供程序中所有组件访问，实现组件之间的传值。并且一个组件的数据变化会映射到使用这个数据的其他组件。

（2）vuex由统一的方法修改数据，全局变量可以任意修改。

（3）全局变量多了会造成命名污染，vuex不会，同时解决了父组件与孙组件，以及兄弟组件之间通信的问题。

 */


Vue.use(Vuex)

export default new Vuex.Store({
  /*定义了应用状态的数据结构，可以在这里设置默认的初始状态*/
  state: {
    iotData: {},
    checkedLayers:[2,21,22,3]
  },
  /*计算过滤操作(允许组件从Store中获取数据,mapGetters 辅助函数仅仅是将store中的getter映射到局部计算属性)*/
  getters: {
    //获取整理过的iot数据
    formatedData: state => {
      return state.iotData
    },
    //获取点击图层
    getCheckedLayers: state => {
      return state.checkedLayers
    },
  },
  //是唯一更改store中状态的方法，且必须是同步函数
  mutations: {
    //iotData
    setIOTData (state, data) {
      state.iotData = data
    },
    //更新数据
    updateIOTTagConfig (state, data) {
      //将websocket传过来的字符串分割处理为数组
      data = data.replace(/'/g, "")
      var array = data.slice(5, -4).split(",")
      var DATA = []
      array.forEach((item) => {
        item = item.split(":")
        DATA.push({
          Id: item[0],
          Num: parseFloat(item[1])
        })
      })
      state.iotData = DATA
    },
    //保存选中图层
    saveCheckedLayers(state, arr) {
      state.checkedLayers = arr
    },
  },
  //用于提交mutation,而不是直接变更状态，可以包含任意异步操作
  actions: {
    updateIOTTagConfig ({ commit, state }, data) {
      //let newData = Object.assign({}, state.iotData)
      commit('updateIOTTagConfig', data)
    },
  },
})
