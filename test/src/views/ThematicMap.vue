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
        label: '父级1',
        excutScript: 'checkedRLT'
      }, {
        id: 2,
        label: '父级2',
        children: [{
          id: 21,
          label: '子级1',
          excutScript: 'checkedDX'
        }, {
          id: 22,
          label: '子级2',
          excutScript: 'checkedBZ'
        }]
      }, {
        id: 3,
        label: '父级3',
        excutScript: 'checkedMONITOR'
      }
      ],
      defaultProps: {
        children: 'children',
        label: 'label',
      },   //默认展开节点
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
    /*父级1*/
    checkedRLT (visible) {
      console.log(visible)
    },
    /*父级2-子级1*/
    checkedDX (visible) {
      console.log(visible)
    },
    /*父级2-子级2*/
    checkedBZ (visible) {
      var map = window.map;
      console.log(visible)
    },
    /*父级3*/
    checkedMONITOR (visible) {
      console.log(visible)
    },

  },
  mounted () {
    console.log(this.cl)
  }
}
</script>
<style>
</style>
