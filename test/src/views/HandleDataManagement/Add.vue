<!--数据管理-新增-->
<template>
  <section style="overflow: hidden; height: 100%;">
    <el-form label-width="80px"
             ref="addForm"
             :model="addForm"
             class="form-box"
             size="mini">
      <el-form-item label="名称"
                    prop="Name">
        <el-input v-model="addForm.Name"
                  auto-complete="off"
                  size="mini"></el-input>
      </el-form-item>
      <el-form-item label="X坐标"
                    prop="X">
        <el-input v-model="addForm.X"
                  type="number"
                  step="0.001"
                  maxlength="11"
                  auto-complete="off"
                  size="mini"></el-input>
      </el-form-item>
      <el-form-item label="Y坐标"
                    prop="Y">
        <el-input v-model="addForm.Y"
                  type="number"
                  step="0.001"
                  maxlength="11"
                  auto-complete="off"
                  size="mini"></el-input>
      </el-form-item>
      <el-form-item style="text-align:right">
        <el-button size="mini"
                   type="primary"
                   @click.native="pick">拾取坐标</el-button>
      </el-form-item>
      <el-form-item label="数值"
                    prop="Num">
        <el-input v-model="addForm.Num"
                  type="number"
                  step="0.001"
                  maxlength="11"
                  auto-complete="off"
                  size="mini"></el-input>
      </el-form-item>
      <el-form-item label="附件">
        <el-upload ref="upload"
                   action=""
                   list-type="picture"
                   accept=".jpg, .jpeg, .png, .gif, .bmp, .JPG, .JPEG, .PBG, .GIF, .BMP"          
                   :file-list="fileList"
                   :on-remove="handleRemove"
                   :on-exceed="handleExceed"
                   :on-change="handleChange"
                   :on-success="uploadSuccess"
                   :auto-upload="false"
                   :http-request="uploadFile"
                   :on-error="error"
                   :before-upload="beforeUpload">
          <el-button slot="trigger"
                     size="small"
                     type="primary">选取文件</el-button>
          <el-button style="margin-left: 10px;"
                     size="small"
                     type="success"
                     @click="submitUpload">上传到服务器</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="备注"
                    prop="Note">
        <el-input v-model="addForm.Note"
                  auto-complete="off"
                  size="mini"></el-input>
      </el-form-item>
    </el-form>
    <el-col :span="24"
            style="text-align:right">
      <el-button size="mini"
                 @click.native="handleCancelForm">取消</el-button>
      <el-button size="mini"
                 type="primary"
                 @click.native="addSubmit"
                 :loading="submitloading">提交</el-button>
    </el-col>
  </section>
</template>

<script>
import helper from '../../components/layer/helper/helper'
import { addData, uploadFile } from '../../api/api'
import { strRebuild, lastSubstring } from '../../../util/strUtil'
import { message } from '../../../util/message'
export default {
  data () {
    return {
      layerid_p: this.info.layerid_p,  //父弹窗id
      layerid_c: this.layerid,  //弹窗id
      submitloading: false,  //提交状态
      addForm: {
        Name: '',
        X: '',
        Y: '',
        Num: '',
        Note: '',
        Attachment:''
      },
      // 附件列表
      fileList: [],
      // 允许的文件类型
      fileType: ['xls', 'xlsx', 'pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'jpeg'],
      // 运行上传文件大小，单位 M
      fileSize: 10,
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
  methods: {
    //新增取消
    handleCancelForm () {
      this.$layer.close(this.layerid_c);
    },
    //新增提交
    addSubmit () {
      this.submitloading = true
      let form = Object.assign({}, this.addForm)
      //提交的数据至少有一个名称值
      if (form.Name == null || form.Name == '') {
        this.$message({
          message: "名称不能为空",
          type: 'warning',
        })
        this.submitloading = false
        return
      }
      addData(form).then((res) => {
        if (res.data.success) {
          this.$message({
            message: res.data.msg,
            type: 'success',
          })
          //刷新表格
          helper.btnyes(null, this.lyoption)
          //关闭弹窗
          this.$layer.close(this.layerid_c)
        }
        else {
          this.$message({
            message: res.data.msg,
            type: 'error',
          })
        }
      }).catch((e) => {
        this.$message({
          message: e.message,
          type: 'error',
        })
      }).finally(() => {
        this.submitloading = false
      })
    },
    //拾取坐标
    pick () {
      let that = this
      //最小化弹窗
      this.$layer.min(that.layerid_p)
      this.$layer.min(that.layerid_c)
      var map = window.map
      function pickcallback (event) {
        that.addForm.X = parseFloat(event.mapPoint.x).toFixed(3)
        that.addForm.Y = parseFloat(event.mapPoint.y).toFixed(3)
        that.$layer.restore(that.layerid_p)
        that.$layer.restore(that.layerid_c)
        //这里一定要解绑事件，不然多个弹窗同时操作的时候弹窗的id会只认识第一次绑定时的id，导致无法进行多个弹窗同时操作
        bindClick && bindClick.remove()
      }
      var bindClick = map.on('click', function (event) {
        pickcallback(event)
      })
    },
    // 移除附件
    handleRemove (file, fileList) {
       this.fileList=[]
       this.$message({
         type:"success",
         message:"移除附件成功"
       })
    },
    //禁止删除
    beforeRemove () {
      return false
    },
    // 超过限制数量
    handleExceed (files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    // 上传前
    beforeUpload (file) {
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
      // 限制上传格式为图片
      // const isIMAGE = file.type === 'image/jpeg'||'image/gif'||'image/png';
      const extension = testmsg === 'xls' || 'xlsx'
      const isLt2M = file.size / 1024 / 1024 < 10     //这里做文件大小限制  
      if (!extension) {
        this.$message({
          message: '上传文件只能是 xls、xlsx格式!',
          type: 'warning'
        });
      }
      if (!isLt2M) {
        this.$message({
          message: '上传文件大小不能超过 10MB!',
          type: 'warning'
        });
      }
      return extension && isLt2M
    },
    //上传成功
    uploadSuccess (response, file, fileList) {
      if (response.code == 200) {
        //状态码为200时则上传成功 
      } else {
        //状态码不是200时上传失败 从列表中删除
        fileList.splice(fileList.indexOf(file), 1);
      }
    },
    //手动上传
    submitUpload () {
      this.$refs.upload.submit();
    },
    //上传文件处理
    handleChange (file, fileList) {
      if (fileList.length > 0) {
        this.fileList=[fileList[fileList.length - 1]]// 这一步，是 展示最后一次选择的文件
      }
    },
    //上传到服务器
    uploadFile (params) {
      const form = new FormData()
      form.append('file', params.file,params.file.name)
      uploadFile(form).then(response => {
        if (response.data.success) {
          this.$message({
            message: response.data.msg,
            type: 'success',
          })
          this.addForm.Attachment=response.data.response.replace(/\\/g,"\\\\")         
        }
        else {
          this.$message({
            message: response.data.msg,
            type: 'error',
          })
        }
      })
    },
    //上传失败
    error (response, file, fileList) {
      console.log('上传失败')
    },



  },
  mounted () {
  }
}
</script>

<style scoped>
.form-box {
  margin-top: 10%;
}
</style>