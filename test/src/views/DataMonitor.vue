<!-- 视频监控-->
<template>
  <section>
    <el-table :data="form"
              highlight-current-row
              :header-cell-style="{ 'text-align': 'center' }"
              :cell-style="{ 'text-align': 'center' }"
              row-click="getCurrentRow"
              size="mini"
             
              @selection-change="selsChange"
              border
              stripe
              style="width: 100%;height:450px">
      <!-- <el-table-column type="selection"
                       width="50">
      </el-table-column> -->
      <el-table-column type="index"
                       label="序号"
                       align="center"
                       width="50">
      </el-table-column>
      <el-table-column prop="STATIONNAME"
                       label="名称"
                       width="150"
                       align="center"
                       sortable>
      </el-table-column>
      <el-table-column prop="LOCATION"
                       label="地点"
                       align="center"
                       width="150"
                       sortable>
      </el-table-column>
      <el-table-column label="操作"
                       align="center"
                       width="100">
        <template slot-scope="scope">
          <el-button size="mini"
                     type="primary"
                     @click="handleClick(scope.row)">播放</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :append-to-body="true"
               v-dialogDrag
               :visible.sync="dialogVisible"
               :modal="false"
               :close-on-click-modal="false"
               width="420px">
      <video-player :nvfid="nvfid"
                    v-if="dialogVisible"></video-player>
    </el-dialog>

  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import videoPlayer from './videoPlayer.vue'
export default {
  //组件注册
  components: {
    videoPlayer
  },
  //数据
  data () {
    return {
      form: [],       //列表数据
      listLoading: false,   //列表加载
      lon: 0,               //x坐标
      lat: 0,                //y坐标
      sels: [],
      query: '',
      dialogVisible: false,
      nvfid: "",
    }
  },
  //父组件通过 属性props向下传递数据给子组件(接收来自父组件的数据)
  props: {
    info: {
      type: Object,
      default: () => {
        return {};
      }
    },
    layerid: {
      type: String,
      default: ""
    },
    lydata: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  //方法定义
  methods: {
    selsChange: function (sels) {
      this.sels = sels
      console.log(sels)
    },
    //点击事件，播放视频
    handleClick (row) {
      this.nvfid = row.NVFID,
        this.dialogVisible = true
    }
  },
  //在模板渲染成html后调用，通常是初始化页面完成后，再对html的dom节点进行一些需要的操作
  mounted () {
    //传递来的数据
    this.form.push({
      NVFID: "95f77a35-a611-4546-bf29-23f92b47f7eb",
      LOCATION: "出水口",
      STATIONNAME: "出水口",
      IP: "192.168.0.114"
    })
  }
}

</script>

<style scoped>
/* scoped属性表示该样式只在当前组件内起作用 */
.el-range-editor--mini.el-input__inner {
  height: 28px;

  left: 20px;
  top: 30px;
}
</style>
