// 字符串相关工具类
// 数组根据分隔符重组为字符串
export function strRebuild(arr, split) {
  if (arr === undefined || arr === null || !(arr instanceof Array) || arr.length === 0) {
  return ''
  }
  if (split === undefined || split === null) {
  split = '，'
  }
  var str = ''
  arr.forEach((v, i) => {
  if (i === arr.length - 1) {
  str = str + v
  } else {
  str = str + v + split
  }
  })
  return str
 }
 
 // 截取最后一个特定字符后面的字符串
 export function lastSubstring(str, split) {
  if (str === undefined || str === null || split === undefined || split === null) {
  return ''
  }
  return str.substring(str.lastIndexOf(split) + 1)
 }

 //获取阿里播放器
 export const aliPlayer = (id, url, isCreated) => {
  var player = new Aliplayer({
          id: id,
          width: "420px",
          height: "230px",
          autoplay: false,
          //支持播放地址播放,此播放优先级最高
          source: url,
          isLive: true,
          autoPlayDelay: isCreated ? 0 : 30,
          autoPlayDelayDisplayText: isCreated ? "后台已转码，请稍后..." : "后台正在转码,需要约30s，请稍后..."
      },
      function(player) {
          player.on("canplay", function(e) {
              player.play();
          });
      }
  );
  if (!isCreated) {

      player.autoPlayDelay = 30;
      player.autoPlayDelayDisplayText = "后台正在转码,需要约30s，请稍后...";
  }
  return player;
}