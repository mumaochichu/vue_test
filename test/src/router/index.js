//路由配置文件
import Vue from "vue";
/*引入路由依赖*/
import Router from "vue-router";
/*引入页面组件*/
import HelloWorld from "@/components/HelloWorld";
import Home from "@/components/Home";
/*使用路由依赖*/
Vue.use(Router);

//单页面应用：改变url地址，不会像后端发起请求，并且可以重新渲染页面，达到页面异步更新的效果，而且会留有历史纪录
/*定义路由*/
const router = new Router({
  routes: [
    //主页面
    {
      path: "/",
      name: "Home",
      //非懒加载
      component: Home,
      //子路由
      children: [
        {
          path: "home",
          component: resolve => require(["../components/Map"], resolve)
        },
        {
          path: "helloworld",
          component: resolve => require(["../components/HelloWorld"], resolve)
        }
      ],
    },
    //登录页面
    {
      path: "/login",
      name: "login",
      //懒加载
      component: resolve => require(["../components/Login"], resolve)
    },
    //404页面
    {
      path: "/404",
      name: "notFound",
      component: resolve => require(["../components/notFound"], resolve)
    },
    //路由路径不存在时重定向到404页面
    {
      path: "*", // 此处需特别注意置于最底部
      redirect: "/404"
    }
  ],
  mode: "history" //hash和history（不带#）
});

// 导航守卫
// 使用 router.beforeEach 注册一个全局前置守卫，判断用户是否登陆
// 参数说明：to：要跳转的页面；from：从哪个页面而来；next：执行跳转操作
router.beforeEach((to, from, next) => {
  //对要跳转的页面进行判断
  //当要跳转的页面时登录页时，让它跳转过去
  if (to.path === "/login") {
    next();
  }
  //当要跳转的页面不是登录页时，又要分情况判断
  else {
    let token = window.sessionStorage.data;
    //当用户未登录时，跳转到登录页
    if (!token || token === "") {
      next("/login");
    }
    //当用户已登陆时，该跳到哪个页面就跳到哪个页面
    else {
      next();
    }
  }
});

export default router;
