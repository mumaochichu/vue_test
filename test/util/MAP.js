import $ from 'jquery'
window.arcgisMap = {
  /**
   * 地图窗体控件
   */
   MapWindow: {

    //窗体控件缓存
    _mapWindowCatch: {},

    //根据ID关闭窗体控件
    closeByID: function (id) {

      if (this._mapWindowCatch[id]) {
        this._mapWindowCatch[id].Close();
        delete this._mapWindowCatch[id];
      }
    },

    //判断窗体是否已经存在
    isOpenedByID: function (id) {
      var isOpened = false;
      if (this._mapWindowCatch[id]) {
        // console.log(this._mapWindowCatch);
        isOpened = true;
      }
      return isOpened;
    },

    //关闭所有窗体控件
    closeAll: function () {

      var id;
      for (id in this._mapWindowCatch) {
        this._mapWindowCatch[id].Close();
        delete this._mapWindowCatch[id];
      }
    },
    // openAll:function(){
    //   var id;
    //   for (id in this._mapWindowCatch) {
    //     this._mapWindowCatch[id].Show();
    //   }
    // },
    //显示窗体控件
    showLabel: function (id, map, point, html, canMove) {
      if (!this._mapWindowCatch[id]) {

        var mapWindow = new this.MapWindow(id, map, point, html, canMove);
        this._mapWindowCatch[id] = mapWindow;
        mapWindow.Show();
      } else {
        this._mapWindowCatch[id].Html(html);
        this._mapWindowCatch[id].Point = point;
        this._mapWindowCatch[id].Show();
      }
    },

    showAlarm: function (id, map, point) {
      if (!this._mapWindowCatch[id]) {
        var mapWindow = new this.MapWindow(id, map, point, "", true);
        this._mapWindowCatch[id] = mapWindow;
        mapWindow.ShowAlarm();
      }
    },

    labelAlarm: function (id) {
      if (this._mapWindowCatch[id]) {
        this._mapWindowCatch[id].AlarmShow();
      }
    },

    labelAlarmOnlyOne: function (id) {
      var myId;
      for (myId in this._mapWindowCatch) {
        this._mapWindowCatch[myId].AlarmHide();
      }
      if (this._mapWindowCatch[id]) {
        this._mapWindowCatch[id].AlarmShow();
      }
    },

    //窗体控件对象
    MapWindow: function (id, map, point, html, canMove) {


      var mapWindow = document.getElementById("mapWindow_" + id);
      var alarmLabel = null;
      if (!mapWindow) {
        mapWindow = document.createElement("div");
        mapWindow.setAttribute("id", "mapWindow_" + id);

        mapWindow.style.position = "absolute";
        //mapWindow.setAttribute("width", "0px");
        //mapWindow.setAttribute("height", "0px");
        mapWindow.style.visibility = "hidden";
        // mapWindow.css("position", "absolute");
        // mapWindow.css("height", "0px;");
        // mapWindow.css("width", "0px;");
        // mapWindow.css("visibility", "hidden");
        //放在这里鼠标可以拖动地图
        if (canMove) {
          map.__container.appendChild(mapWindow);
          //$(map.__container).append(mapWindow);
        }
        //这里鼠标不能拖动地图
        else {
          map.container.appendChild(mapWindow);
          //$(map.container).append(mapWindow);
        }
      }
      mapWindow.style.visibility = "hidden";
      mapWindow.innerHTML = html;
      // mapWindow.css("visibility", "hidden");
      // mapWindow.html(html);
      // var $child = mapWindow.children();

      // $child.css({
      //     "position": "absolute",
      //     "top": -($child.height()),
      //     "left": -($child.width() / 2)
      // });
      // mapWindow.css("display", "none");
      // mapWindow.css("visibility", "visible");

      if (mapWindow.children.length > 0) {
        var $child = mapWindow.children[0];

        $child.style.position = "absolute";
        $child.style.top = -($child.height) + 'px';
        $child.style.left = -($child.width / 2) + 'px';
      }
      mapWindow.style.display = "none";
      mapWindow.style.visibility = "visible";
      mapWindow.addEventListener('mouseenter', function () {
        this.style.zIndex = 2;
      })
      mapWindow.addEventListener('mouseleave', function () {
        this.style.zIndex = '';
      })
      // mapWindow.mouseenter(function () {
      //     $(this).css({ "z-index": 2 });
      // });

      // mapWindow.mouseleave(function () {
      //     $(this).css({ "z-index": '' });
      // });

      this.Html = function (html) {
        innerHTML(html);
      };

      //关闭临时图层
      this.Close = function () {
        //解除事件绑定
        dojo.disconnect(onZoomStart);
        dojo.disconnect(onExtentChange);
        dojo.disconnect(onPan);
        //dojo.disconnect(onMouseDown);
        //dojo.disconnect(onMouseDrag);
        //移除临时图层
        mapWindow.parentNode.removeChild(mapWindow);
        // $(mapWindow).hide("slow", function () {
        //     $(mapWindow).remove();
        // });
      };

      this.Show = function () {
        showMapWindow();
      };

      this.ShowAlarm = function () {
        showMapWindow();
        this.AlarmShow();
      };

      this.AlarmShow = function () {
        if (!alarmLabel) {
          alarmLabel = getAlarm();
          mapWindow.prepend(alarmLabel);
        }
      };

      this.AlarmHide = function () {
        if (alarmLabel) {
          $(alarmLabel).remove();
          alarmLabel = null;
        }
      };
      //获取临时图层的坐标
      this.Point = point;

      var innerHTML = function (html) {
        mapWindow.innerHTML = html;
        var hidded = false;
        if (mapWindow.style.display == 'none') {
          mapWindow.style.display = 'block';
          hidded = true;
        }
        if (mapWindow.children.length > 0) {
          var $child = mapWindow.children[0];

          $child.style.position = "absolute";
          $child.style.top = -($child.height) + 'px';
          $child.style.left = -($child.width / 2) + 'px';
        }
        if (hidded) {
          mapWindow.style.display = 'none';
        }
        // mapWindow.html(html);
        // var hidded = false;
        // if (mapWindow.css('display') == 'none') {
        //     //if (!mapWindow.is(":visible")) {
        //     mapWindow.show();
        //     hidded = true;
        // }
        // var $child = mapWindow.children();
        // $child.css({
        //     "position": "absolute",
        //     "top": -($child.height()),
        //     "left": -($child.width() / 2)
        // });
        // if (hidded) {
        //     mapWindow.hide();
        // }
      };

      //私有方法：绘制报警动画
      var getAlarm = function () {
        var alarmCanvas = document.createElement('canvas');
        alarmCanvas.style.position = "absolute";
        alarmCanvas.setAttribute("width", "200px");
        alarmCanvas.setAttribute("height", "200px");
        alarmCanvas.style.left = "-100px";
        alarmCanvas.style.top = "-100px";
        alarmCanvas.style.zIndex = 1;

        var ctx = alarmCanvas.getContext("2d");

        var radius = 0;

        var ap = 1.0;
        var d = 1 / (60.0 / 5);
        var i = 0;
        var drawEllipse = setInterval(function () {
          ctx.clearRect(0, 0, 700, 550);

          var grd = ctx.createRadialGradient(100, 100, 0, 100, 100, radius);

          grd.addColorStop(0, "rgba(230, 0, 0, 0)");
          grd.addColorStop(0.25, "rgba(230, 0, 0, " + ap + ")");
          grd.addColorStop(0.5, "rgba(230, 0, 0, 0)");
          grd.addColorStop(0.75, "rgba(230, 0, 0, " + ap + ")");
          grd.addColorStop(1, "rgba(230, 0, 0, 0)");

          ctx.beginPath();
          ctx.arc(100, 100, radius, 0, 2 * Math.PI, true);
          ctx.fillStyle = grd;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(100, 100, 5, 0, 2 * Math.PI, true);
          ctx.fillStyle = "rgba(230, 0, 0,1)";
          ctx.fill();

          if (radius >= 60 && ap <= 1 && ap >= 0) {
            radius = 1; ap = 1.0;
          }
          i += 1;
          radius += 5;
          ap = ap / 1.16;

        }, 100);
        return alarmCanvas;
      };

      //私有方法：绘制临时图层
      var showMapWindow = function () {
        var point = arcgisMap.MapWindow._mapWindowCatch[id].Point;

        var location = map.toScreen(point);
        if (location.x > 0 && location.y > 0 && location.x < map.width && location.y < map.height) {
          mapWindow.style.top = location.y + 'px';
          mapWindow.style.left = location.x + 'px';
          mapWindow.style.display = 'block';
          // mapWindow.css("top", location.y);
          // mapWindow.css("left", location.x);
          //mapWindow.fadeIn();
        } else {
          //mapWindow.hide();
          mapWindow.style.display = 'none';
        }
      };

      //私有方法：绑定地图缩放开始事件
      var onZoomStart = dojo.connect(map, "onZoomStart", function () {
        mapWindow.style.display = 'none';
        //$(mapWindow).hide();
      });

      //私有方法：绑定地图缩放事件
      var onExtentChange = dojo.connect(map, "onExtentChange", function () {

        showMapWindow();
      });

      var onPan = dojo.connect(map, "onPan", function (extent, p) {
        var location = map.toScreen(point);
        mapWindow.style.left = (location.x + p.x) + 'px';
        mapWindow.style.top = (location.y + p.y) + 'px';

        // mapWindow.css("left", location.x + p.x);
        // mapWindow.css("top", location.y + p.y);
      });
    }
  },
}
