/*地图组件
*/
<template>
  <div>
    
    <div ref="cesiumContainer" style="width: 100%; height: 100%"></div>
    <el-dialog
      title="提示"
      :visible.sync="centerDialogVisible"
      width="30%"
      center
      id="msg"
    >
    </el-dialog>
  </div>
</template>
<script>


export default {
  data() {
    return {
      centerDialogVisible: false,
    };
  },
  mounted() {},
  methods: {
    /*实例化球
     */
    create() {
      if (this.Earth) {
        // this.Earth.initEarth(this.$refs.cesiumContainer);
      }
    },
    destroy() {
      if (
        this.Earth &&
        this.Earth.viewer &&
        this.Earth.viewer.isDestroyed() == false
      ) {
        this.Earth.viewer.destroy();
      }
    },
  },
 
};
</script>

<style  scoped>
.cesiumContainer {
  overflow-y: hidden;
  overflow-x: hidden;
  z-index: 1;
}
</style>