import axios from 'axios'
import qs from 'Qs'
// 跨域相关
// url基础前缀
axios.defaults.baseURL="/api"
// post请求类型
axios.defaults.headers.post['Content-Type']='application/json';

let base='https://localhost:44328'   //本地运行API地址
//let base='https://localhost:8081'  
//let base='http://127.0.0.1:80'         //本地IIS发布API地址    
// 请求延时（毫秒数，如果请求话费超过了'timeout'的时间，请求将被中断）
axios.defaults.timeout = 100000
//请求拦截器
axios.interceptors.request.use(
  config => {
    //在发送请求前，做特殊字符的拦截，防止SQL注入
    if(config.params&&config.params.key){
      let value=config.params.key
      value = value.replace(/from|select|update|and|or|delete|insert|trancate|char|into|substr|ascii|declare|exec|count|master|into|drop|execute/i, '');
      config.params.key=value
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);


// export const getAllData = params => {
//   return axios.get(`/api/projectInfo/GetAll`,{ params: params });
// };
/**
 * 获取导航菜单数据
 * @returns 
 */
export const getMenu = () => {
  return axios.get(`${base}/api/Menu/Get`);
};

/**
 * 判断用户名密码组合是否正确
 * @param {*} params 
 * @returns 
 */
export const getToken = params => {
  return axios.get(`${base}/api/Userinfo/Get`,{ params: params });
};

/**
 * 获取数据管理页面数据（分页）
 * @param {*} params 
 * @returns 
 */
export const getData = params => {
  return axios.get(`${base}/api/Data/GetAsync`,{ params: params });
};
/**
 * 获取数据管理页面数据（全部）
 * @param {*} params 
 * @returns 
 */
 export const getAllData = params => {
  return axios.get(`${base}/api/Data/GetAll`,{params:params});
};

/**
 * 数据管理页面根据id获取一条数据
 * @param {*} id 
 * @returns 
 */
export const GetDataById = id => {
  return axios.get(`${base}/api/Data/GetById/${id}`)
};

/**
 * 数据管理页面新增一条数据
 * @param {*} params 
 * qs.stringify()将对象 序列化成URL的形式，以&进行拼接，来传递参数
 * @returns 
 */
export const addData = params => {
  return axios.post(`${base}/api/Data/post`, qs.stringify(params),{headers:{"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"}} ) // 这里是跨域的写法
};

/**
 * 数据管理页面编辑一条数据
 * @param {*} params 
 * @returns 
 */
export const editData = params => {
  return axios.post(`${base}/api/Data/put`, qs.stringify(params),{headers:{"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"}} ) // 这里是跨域的写法
};

/**
 * 数据管理页面根据id删除一条数据
 * @param {*} id 
 * @returns 
 */
export const DeleteDataById = id => {
  return axios.get(`${base}/api/Data/DeleteById/${id}`);
}

/**
 * 附件上传
 * @param {*} params 
 * @returns 
 */
export const uploadFile=params=> {
  return axios.post(`${base}/api/Img/PostAttachFiles`,params,{headers:{"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"}})
 }

