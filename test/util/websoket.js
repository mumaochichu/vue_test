let glSocket = null;
import store from "../src/store";
import { Message, MessageBox } from "element-ui";
export const localSocket = self => {
  if ("WebSocket" in window) {
    if (!glSocket) {
      glSocket = new WebSocket(window.DATA_PATH);
      glSocket.binaryType = "arraybuffer";
      glSocket.onopen = () => {
        //websocket连接
        Message({
          showClose: true,
          message: "websocket连接成功",
          type: "success",
          duration: 1000
        });
      };
      glSocket.onclose = () => {
        // 关闭 websocket
        Message({
          showClose: true,
          message: "连接已关闭",
          type: "warning",
          duration: 1000
        });
        //断线重新连接提示
        MessageBox.confirm(
          "websocket连接中断，是否要重新连接？",
          "websocket连接提示",
          {
            confirmButtonText: "是",
            cancelButtonText: "否",
            showCancelButton: true
          }
        )
          .then(() => {
            localSocket();
          })
          .catch(() => {
          });
        // setTimeout(() => {
        //   localSocket();
        // }, 2000);
      };
      //用于指定收到服务器数据后的回调函数
      glSocket.onmessage = msg => {
        glSocket.send(111);
        //websocket接受信息
        let d = JSON.stringify(msg.data);
        //dispatch异步(执行store里面action里的方法),commit同步(执行store里面mutations里的方法)
        store.dispatch("updateIOTTagConfig", d);
      };
    }
  } else {
    // 浏览器不支持 WebSocket
    Message({
      showClose: true,
      message: "您的浏览器不支持websocket，请更换其它浏览器再尝试",
      type: "error",
      duration: 2000
    });
  }
};

export default glSocket;
