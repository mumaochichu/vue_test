import esriLoader from "esri-loader"
/**
 * 移动轨迹
 * @param {Array[][]} moveTra   轨迹点数组： 例:[[116.895, 36.6513], [116.972, 36.773], [117.089212, 36.65343],……]
 * @param {Number} speed       移动速度：单位 ms
 * @param {Array[]}    attrCar      小车对象属性：例：["imageUrl",imageWidth,imageHeight]
 */
var graphicOfCar;
export const movementInit = (map, moveTra, speed, attrCar, colorTra) => {
  esriLoader.loadCss("https://js.arcgis.com/3.18/esri/css/esri.css");
  esriLoader.loadModules(
    [
      'esri/geometry/Point',
      'esri/symbols/PictureMarkerSymbol',
      'esri/geometry/Polyline',
      'esri/SpatialReference',
      'esri/symbols/SimpleLineSymbol',
      'esri/graphic',
      'dojo/domReady!',
    ])
    .then(([
      Point,
      PictureMarkerSymbol,
      Polyline,
      SpatialReference,
      SimpleLineSymbol,
      Graphic
    ])=> {
      //初始化轨迹  【选择保留】
      if (window.isPos == true && window.start == 0) {
        var polyline = new Polyline(moveTra)
        if (null == colorTra) {
          var lineSymbol = new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_DASH,
            new esri.Color([0, 255, 0]),
            2
          )
        } else {
          var lineSymbol = new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_DASH,
            new esri.Color(colorTra),
            2
          )
        }
        var graphicOfLine = new Graphic(polyline, lineSymbol)
        map.graphics.add(graphicOfLine)
        //初始化小车对象
        var point = new Point(moveTra[0][0], moveTra[0][1])
        var pictureMarkerSymbol = new PictureMarkerSymbol(
          attrCar[0],
          attrCar[1],
          attrCar[2]
        )
        graphicOfCar = new Graphic(point, pictureMarkerSymbol)
        map.graphics.add(graphicOfCar)
        graphicOfCar.geometry.x = moveTra[0][0]
        graphicOfCar.geometry.y = moveTra[0][1]
        move(map, 0, 1, speed, graphicOfCar, moveTra)
      } else {
        console.log(graphicOfCar)
        move(map, window.start, window.end, speed, graphicOfCar, moveTra)
      }
    }
  )
}
//根据序列点坐标 进行移动
function move(map, start, end, rush, car, points) {
  rush = window.speed/10
  //先算第一个点和第二个点的关系  之后一次算每个点和下一个点的关系
  var x1 = points[start][0]
  var y1 = points[start][1]
  var x2 = points[end][0]
  var y2 = points[end][1]
  var p = (y2 - y1) / (x2 - x1) //斜率
  var v = 0.00001 //距离  距离越小 位置越精确
  var moving = setInterval(function() {
    //分别计算 x,y轴方向速度
    if (Math.abs(p) == Number.POSITIVE_INFINITY) {
      //无穷大
      if(p==Number.POSITIVE_INFINITY){
        car.geometry.y += v
      }
      else{
        car.geometry.y -= v
      }
    } else {
      if (x2 < x1) {
        car.geometry.x -= (1 / Math.sqrt(1 + p * p)) * v
        car.geometry.y -= (p / Math.sqrt(1 + p * p)) * v
        //计算汽车角度
        car.symbol.angle = CalulateXYAnagle(x1, y1, x2, y2)
      } else {
        car.geometry.x += (1 / Math.sqrt(1 + p * p)) * v
        car.geometry.y += (p / Math.sqrt(1 + p * p)) * v
        //计算汽车角度
        car.symbol.angle = CalulateXYAnagle(x1, y1, x2, y2)
      }
    }
    //图层刷新
    map.graphics.redraw()
    if (window.isPos == false) {
      window.start = start
      window.end = end
      clearInterval(moving)
    }
    if (
      Math.abs(car.geometry.x - x2) <=v &&
      Math.abs(car.geometry.y - y2) <= v
    ) {
      clearInterval(moving)
      start++
      end++
      if (end < points.length) move(map, start, end, rush, car, points)
    }
  }, rush)
}
//计算小车移动角度
function CalulateXYAnagle(startx, starty, endx, endy) {
  var tan =
    (Math.atan(Math.abs((endy - starty) / (endx - startx))) * 180) / Math.PI +
    90 //车头旋转角度（根据图片调整）
  if (endx > startx && endy > starty) {
    //第一象限
    return -tan + 180
  } else if (endx > startx && endy < starty) {
    //第二象限
    return tan
  } else if (endx < startx && endy > starty) {
    //第三象限
    return tan - 180
  } else {
    //第四象限
    return -tan
  }
}

//向小车添加自定义属性
function setAttrForGraphic(graphic, attr) {
  if (isObjectNull(graphic)) {
    return
  }
  var attrold = graphic.attributes
  if (attrold != null && attrold != undefined) {
    for (var p in attr) {
      attrold[p] = attr[p]
    }
    attr = attrold
  }
  graphic.setAttributes(attr)
}

/**
 * 根据回放速度在两点之间进行插值
 */
function interpolation(pointA, pointB, speed) {
  var tmp = []
  if (speed == undefined) {
    speed = 2
  }
  var count = Math.abs(speed)

  var x1 = Math.abs(pointB.x - pointA.x)
  var y1 = Math.abs(pointB.y - pointA.y)
  var z1 = Math.sqrt(x1 * x1 + y1 * y1)
  count = z1 / count

  var disX = (pointB.x - pointA.x) / count
  var disY = (pointB.y - pointA.y) / count
  var i = 0
  while (i <= count) {
    var x = pointA.x + i * disX
    var y = pointA.y + i * disY
    tmp.push({ x: x, y: y })
    i++
  }
  tmp.push(pointB) //防止插值出来的最后一个点到不了B点
  return tmp
}

//读取小车的自定义属性
function getAttrForGraphic(graphic) {
  if (isObjectNull(graphic)) {
    return
  }
  return graphic.attributes
}
