<!--图层控制-->
<template>
  <div>
    <el-tree :data="data"
             show-checkbox
             node-key="id"
             @check="CheckLayer"
             :default-expanded-keys="[1,2]"
             :default-checked-keys="CheckedLayers"
             :props="defaultProps">
    </el-tree>
  </div>
</template>
<script>
import {mapState, mapGetters, mapMutations } from 'vuex'
export default {
  data () {
    return {
      data: [{
        id: 1,
        label: '热力图',
        excutScript: 'checkedRLT'
      }, {
        id: 2,
        label: '天地图',
        children: [{
          id: 21,
          label: '地形数据',
          excutScript: 'checkedDX'
        }, {
          id: 22,
          label: '矢量标注',
          excutScript: 'checkedBZ'
        }]
      }, {
        id: 3,
        label: '模拟实时数据监测',
        excutScript: 'checkedMONITOR'
      }
        // ,{
        //   id:4,
        //   label:'点聚合图层',
        //   excutScript: 'checkedCLUSTER'
        // }
      ],
      defaultProps: {
        children: 'children',
        label: 'label',
      }
    }
  },
  computed: {
    ...mapState({
      CheckedLayers: "checkedLayers",
    }),  
  },
  methods: {
    ...mapMutations([ 
      'saveCheckedLayers',
    ]),
    //注释的saveCheckedLayers()方法和上面使用辅助函数的效果相同
    // saveCheckedLayers(arr){
    //   this.$store.commit("saveCheckedLayers",arr)
    // },
    /**
     * 选中/取消选中图层
     * @ node 点击节点
     * @ selected 当前选中的所有节点
     */
    CheckLayer (node, selected) {
      let _this = this;
      //提交mutation改变checkedLayers的值
      this.saveCheckedLayers(selected.checkedKeys)
      if (node.children) {
        node.children.forEach(function (item) {
          _this.applyEvent(item, selected.checkedKeys.indexOf(item.id) != -1)
        })
      } else {
        _this.applyEvent(node, selected.checkedKeys.indexOf(node.id) != -1)
      }
    },
    /**
     * 触发事件
     * @ treeNode 点击节点
     * @ visible  图层是否显示
     */
    applyEvent (treeNode, visible) {
      let eventName = treeNode.excutScript
      let _this = this;
      if (eventName == 'checkedRLT' || eventName == 'checkedDX' || eventName == 'checkedBZ' || eventName == 'checkedMONITOR' || eventName == 'checkedCLUSTER') {
        _this[eventName](visible);
      }
    },
    /*热力图*/
    checkedRLT (visible) {
      
      let map = window.map
      var layer_rlt = map && map.getLayer('rlt')
      layer_rlt && layer_rlt.setVisibility(visible)
    },
    // /*点聚集*/
    // checkedCLUSTER (visible) {
    //   let map = window.map
    //   var layer_clusters = map && map.getLayer('clusters')
    //   layer_clusters && layer_clusters.setVisibility(visible)
    // },
    /*天地图地形*/
    checkedDX (visible) {
      var map = window.map;
      var layer_dx = map.getLayer("Tianditu");
      layer_dx && layer_dx.setVisibility(visible);
    },
    /*天地图标注*/
    checkedBZ (visible) {
      var map = window.map;
      var layer_bz = map.getLayer("Tianditu2");
      layer_bz && layer_bz.setVisibility(visible);
    },
    /*模拟实时数据*/
    checkedMONITOR (visible) {
      var map = window.map;
      var layer_monitor = map.getLayer("monitor");
      layer_monitor && layer_monitor.setVisibility(visible);

      if (!visible) {
        for (let id in window.arcgisMap.MapWindow._mapWindowCatch) {
          document.getElementById('mapWindow_' + id).style.visibility='hidden' 
        }
      }
      else {
         for (let id in window.arcgisMap.MapWindow._mapWindowCatch) {
          document.getElementById('mapWindow_' + id).style.visibility='visible' 
        }
      }

    },

  },
  mounted () {
  }
}
</script>
<style>
</style>
