<!--数据管理-详情-->
<template>
  <section class="container">
    <el-form :model="detailForm"
             label-width="80px"
             ref="detailForm"
             size="mini"
             class="form-box">
      <el-form-item label="名称"
                    class="form-item"
                    prop="Name">
        <el-tag class="form-item">{{ detailForm.Name }}</el-tag>
      </el-form-item>
      <el-form-item label="X坐标"
                    class="form-item"
                    prop="X">
        <el-tag class="form-item">{{ detailForm.X }}</el-tag>
      </el-form-item>
      <el-form-item label="Y坐标"
                    class="form-item"
                    prop="Y">
        <el-tag class="form-item">{{ detailForm.Y }}</el-tag>
      </el-form-item>
      <el-form-item label="数值"
                    class="form-item"
                    prop="Num">
        <el-tag class="form-item">{{ detailForm.Num }}</el-tag>
      </el-form-item>
      <el-form-item label="附件"
                    class="form-item"
                    prop="Attachment">
        <el-image style="width: 100px; height: 100px"
                  :src="url"
                  v-if="attach_exist"
                  :preview-src-list="srcList">
        </el-image>
        <el-tag v-else class="form-item">{{ attact_prompt }}</el-tag>
      </el-form-item>
      <el-form-item label="备注"
                    class="form-item"
                    prop="Note">
        <el-tag class="form-item">{{ detailForm.Note }}</el-tag>
      </el-form-item>
    </el-form>
  </section>
</template>

<script>
import { GetDataById } from '../../api/api'
export default {
  data () {
    return {
      layerid_p: null,  //父弹窗id
      layerid_c: this.layerid,  //弹窗id
      fit: ['fill'],
      detailForm: {
        Name: '',
        X: '',
        Y: '',
        Num: '',
        Note: '',
        Attachment: '',
      },
      url: '',
      srcList: [],
      attact_prompt:"暂无附件",
      attach_exist:false,  //是否存在附件
    }
  },
  props: {
    info: {
      type: Object,
      default: () => {
        return {}
      },
    },
    layerid: {
      type: String,
      default: '',
    },
    lyoption: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  mounted () {
    // let Id=this.info.Id
    // //根据数据Id获取数据
    // GetDataById(Id).then((res)=>{
    //   this.detailForm=res.data.response.data[0]
    // })
    //直接使用传递来的数据
    this.detailForm = this.info.model
    if (this.detailForm.Attachment) {
      this.attach_exist=true
      this.url= "http://localhost:8083/API/API/" +this.detailForm.Attachment  //本地运行使用
      //this.url = "http://127.0.0.1:80/" + this.detailForm.Attachment              //本地IISAPI使用
      this.srcList.push(this.url)
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
}
.form-box {
  box-sizing: border-box;
  padding: 5px 15px;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-content: center;
  flex-wrap: wrap;
}
.form-item {
  min-width: 150px;
  flex: 1;
  flex-basis: 150px;
}
</style>
