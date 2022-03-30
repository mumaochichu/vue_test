<!--退出登录-->
<template>
  <div>
    <el-button @click="out"
               class="out_bt">退出登录</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    out () {
      this.$confirm('是否退出登录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'waring'
      }).then(() => {
        //清空token
        window.sessionStorage.clear()
        //跳转到登录页
        this.$router.push('/login')
      }).catch(()=>{
          this.$message({
            typeA:'info',
            message:'已取消操作'
          })
      })
     
    }
  }
}
</script>

<style scoped>
div{
  right:20px;
  top:10px;
  position: absolute;
}
.out_bt {
  float: right; 
}
</style>