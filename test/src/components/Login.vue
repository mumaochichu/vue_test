<!--登录页-->
<template>
  <div class="login-container">
    <el-form ref="form"
             :model="loginForm"
             label-width="80px"
             class="login-form">
      <h2 class="login-title">管理系统</h2>
      <el-form-item label="用户名">
        <el-input v-model="loginForm.username"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="loginForm.password"
                  show-password></el-input>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="checked">记住密码</el-checkbox>
        <el-button type="primary"
                   @click="login">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
 
<script>
import { getToken } from '../api/api'
export default {
  name: "login",
  data () {
    return {
      checked: '',
      loginForm: {
        username: '',
        password: ''
      }
    };
  },
  methods: {
    //登录
    login () {
      let _this = this;
      //判断记住密码复选框是否被勾选 勾选则调用配置cookie方法
      if (_this.checked == true) {
        console.log("checked == true");
        //传入账号名，密码，和保存天数3个参数
        _this.setCookie(_this.loginForm.username, _this.loginForm.password, 7);
      } else {
        console.log("清空Cookie");
        //清空Cookie
        _this.clearCookie();
      }
      //判断账号密码是否为空
      if (this.loginForm.username === '' || this.loginForm.password === '') {
        alert('账号或密码不能为空');
      } else {
        let params = {
          username: this.loginForm.username,
          password: this.loginForm.password
        }
        //loading加载
        const loading = this.$loading({
          lock: true,
          text: '登陆中',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        //判断数据的账号密码是否与数据库中的一致
        getToken(params).then(res => {
          //若返回有值，则账号密码正确
          if (res.data != null && res.data.success) {
            //自定义一个token
            _this.userToken = 'Bearer ' + "12345qwer";
            //使用 sessionStorage 创建一个本地存储的 name/value 对(用于判断用户是否登录)
            window.sessionStorage.setItem('data', _this.userToken)
            loading.close();
            //页面跳转到home页
            _this.$router.push('/home');
            this.$message({
              message: '登录成功',
              type: 'success',
            })
          }
          else {
            this.$message({
              message: '账号或密码错误',
              type: 'error',
            })
          }
        }).catch(error => {
          this.$message({
            message: '登陆失败',
            type: 'error',
          })
          console.log(error);
        }).finally(() => {
          //结束加载状态
          loading.close();
        });
      }
    },
    //JS设置cookie
    setCookie (c_name, c_pwd, exdays) {
      var exdate = new Date(); //获取时间
      exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays); //保存的天数
      //字符串拼接cookie
      window.document.cookie = "userName" + "=" + c_name + ";path=/;expires=" + exdate.toGMTString();
      window.document.cookie = "userPwd" + "=" + c_pwd + ";path=/;expires=" + exdate.toGMTString();
    },
    //读取cookie
    getCookie: function () {
      if (document.cookie.length > 0) {
        var arr = document.cookie.split('; '); //这里显示的格式需要切割一下自己可输出看下
        for (var i = 0; i < arr.length; i++) {
          var arr2 = arr[i].split('='); //再次切割
          //判断查找相对应的值
          if (arr2[0] == 'userName') {
            this.loginForm.username = arr2[1]; //保存到保存数据的地方
          } else if (arr2[0] == 'userPwd') {
            this.loginForm.password = arr2[1];
          }
        }
      }
    },
    //清除cookie
    clearCookie: function () {
      this.setCookie("", "", -1); //修改2值都为空，天数为负1天就好了
    }
  },
  mounted () {
    //页面加载调用获取coolie值
    this.getCookie()
  }
};
</script>
<style acoped>
.login-form {
  width: 350px;
  margin: 160px auto; /* 上下间距160px，左右自动居中*/
  background-color: rgb(255, 255, 255, 0.8); /* 透明背景色 */
  padding: 30px;
  border-radius: 20px; /* 圆角 */
}

/* 背景 */
.login-container {
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-image: url("../assets/images/login.png");
}

/* 标题 */
.login-title {
  color: #303133;
  text-align: center;
}
</style> 