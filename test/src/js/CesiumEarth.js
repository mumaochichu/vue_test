/* eslint-disable no-undef */
/*cesium三维模块（创建地球、加载数据、飞行定位、绘制清除、模型操作、渲染操作）
 *
 */
//import func from './func.js'; //功能逻辑
// Cesium 球体操作相关（加载数据，定位、高亮等）
export default {
	Vue: null,
	viewer: null,

	Draw3DObjSet: {}, //通用绘制要素词典  参考方法1 this.addValueToDrawObjSet 方法2 this.remove3DObj
	Cesium3DTileDatas: [], //DOM和Modeld等
	OnlineMaps: [], //在线地图
	ImageLayerArr: [], //需要清除的绘制底图图层（如等值面）
	datasource: [],//添加到地图上的标签 清除用
	TransparencyAlpha: 1, //地面透明值
	ClickHandler: null, //销毁属性查询、空间查询等鼠标输入事件

	init: function (vueObj) {
		let _this = this;
		_this.Vue = vueObj;
		// _this.func = new func(_this.Vue);
	},
	/*实例化球及加载地图
	 *@param：divobj {String} 地图容器id 【必选】
	 *@param:vueObj {Object} Vue对象 【必选】
	 */
	initEarth: function (divobj) {
		let _this = this;
		Cesium.Ion.defaultAccessToken = _this.Vue.$store.state.mapConfig.defaultAccessToken;
		// 实例化地球
		let viewerOption = {
			// shouldAnimate: false,//动画自动播放
			animation: false, // 动画控制，默认true （图中1）
			timeline: false, // 时间线,默认true  （图中3）
			baseLayerPicker: false, // 地图切换控件(底图以及地形图)是否显示,默认显示true  （图中6）
			fullscreenButton: true, // 全屏按钮,默认显示true  （图中4）
			geocoder: false, // 地名查找,默认true  （图中9）
			// vrButton: false , // 双屏模式,默认不显示false
			homeButton: false, // 主页按钮，默认true  （图中8）
			infoBox: true, // 点击要素之后显示的信息,默认true
			selectionIndicator: true, // 选中元素显示,默认true
			CreditsDisplay: false, // 展示数据版权属性
			sceneModePicker: false, //二三维切换按钮
			navigationHelpButton: false, // 问号图标，导航帮助按钮，显示默认的地图控制帮助
			contextOptions: {
				webgl: {
					preserveDrawingBuffer: true, //cesium状态下允许canvas转图片convertToImage
				},
			},
		};
		let viewer = new Cesium.Viewer(divobj, viewerOption);
		_this.viewer = viewer;
		viewer._cesiumWidget._creditContainer.style.display = 'none'; // 去掉版权信息
		// viewer.scene.globe.enableLighting = true;//开启场景光照阴影
		// viewer.scene.globe.baseColor = Cesium.Color.WHITE.withAlpha(0);//地球颜色
		viewer.scene.backgroundColor = Cesium.Color.LIGHTSLATEGREY; //new Cesium.Color(65,105,225,1);//修改背景颜色
		// viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#D1EEEE')//修改背景颜色
		// viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('rgba(173, 216, 230, 1)')//修改背景颜色
		//设置初始化球体遮挡
		viewer.scene.highDynamicRange = !1;
		viewer.scene.skyAtmosphere.show = !1;
		viewer.scene.skyBox.show = !1;
		viewer.scene.globe.depthTestAgainstTerrain = true; // 深度检测
		viewer.scene.postProcessStages.fxaa.enabled = true; //抗锯齿
		// viewer.scene.globe.atmosphereBrightnessShift = -0.5;//大气亮度
		viewer.screenSpaceEventHandler.setInputAction(function () { }, Cesium.ScreenSpaceEventType
			.LEFT_DOUBLE_CLICK); //禁用双击
		viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2019-07-20T13:00:08");
		// _this.show3DCoordinates();

		_this.FlyToChina();

		/*添加地图到地球*/
		_this.addDataToEarth();
		_this.initMapLogic(); //其他第三方地图逻辑
		_this.addModels();
		//_this.getDataByClickEvent();//激活点击事件
	},
	/*23D地图切换
	 *@param:type {number} 切换到xx视图 eg:2/3/2.5【必选】
	 */
	switchMap23D(type) {
		let _this = this;
		switch (type) {
			case 2:
				_this.viewer.scene.morphTo2D(1);
				break;
			case 2.5:
				_this.viewer.scene.morphToColumbusView(1);
				break;
			case 3:
				_this.viewer.scene.morphTo3D(1);
				break;
		}
	},
	/*初始化一些其他地图逻辑
	 *①eg:坐标投影转换逻辑
	 */
	initMapLogic: function () {
		var configArr = this.Vue.$store.state.mapConfig.proj4EpsgConfig;
		if (proj4 && ol && ol.proj && ol.proj.proj4 && configArr) {
			proj4.defs(configArr);
			ol.proj.proj4.register(proj4);
		}
	},
	/*鼠标滑动坐标
	 */
	show3DCoordinates: function () {
		let _this = this;
		let viewer = this.viewer;
		let handler3D = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		handler3D.setInputAction(function (movement) {
			let pick = new Cesium.Cartesian2(
				movement.endPosition.x,
				movement.endPosition.y
			);
			if (pick) {
				let cartesian = viewer.scene.globe.pick(
					viewer.camera.getPickRay(pick),
					viewer.scene
				);
				if (cartesian) {
					// 世界坐标转地理坐标（弧度）
					let cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(
						cartesian
					);
					if (cartographic) {
						// 海拔
						let height = viewer.scene.globe.getHeight(cartographic);
						// 视角海拔高度
						let he = Math.sqrt(
							viewer.scene.camera.positionWC.x *
							viewer.scene.camera.positionWC.x +
							viewer.scene.camera.positionWC.y *
							viewer.scene.camera.positionWC.y +
							viewer.scene.camera.positionWC.z *
							viewer.scene.camera.positionWC.z
						);
						let he2 = Math.sqrt(
							cartesian.x * cartesian.x +
							cartesian.y * cartesian.y +
							cartesian.z * cartesian.z
						);
						// 地理坐标（弧度）转经纬度坐标
						let point = [
							(cartographic.longitude / Math.PI) * 180,
							(cartographic.latitude / Math.PI) * 180
						];
						if (!height) {
							height = 0;
						}
						if (!he) {
							he = 0;
						}
						if (!he2) {
							he2 = 0;
						}
						if (!point) {
							point = [0, 0];
						}
						let cameraData = _this.getCameraData();
						let cameracontent = "相机坐标:(" + cameraData.X + "," + cameraData.Y + "," + cameraData
							.Z + ") ,H:" + cameraData.heading.toFixed(2) + "," + "P:" + cameraData.pitch
								.toFixed(2) + "," + "R:" + cameraData.roll.toFixed(2);
						let content = "视角海拔高度:" + (he - he2).toFixed(2) + "米" + "  海拔:" + height.toFixed(
							2) + "米" + "  经度:" + point[0].toFixed(6) + " 纬度:" + point[1].toFixed(6);
						content += "  " + cameracontent;
						window.setMapCoordInfo(content);
					}
				}
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	},


	/*添加数据到球体
	 */
	addDataToEarth: function () {
		let _this = this;
		_this.removeAll(); //清除已有所有图层
		_this.addImageBackground(); //添加背景图
		let mapConfig = this.Vue.$store.state.mapConfig;
		//加载在线arcigs
		_this.addImageryProvider({
			label: 'Arcgis影像',
			loadType: 'ArcGisMapServerImageryProvider',
			url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
			layer: 'img',

		});

		//加载在线天地图影像
		// _this.addImageryProvider({
		// 	label: '天地图影像',
		// 	loadType: 'WebMapTileServiceImageryProvider',
		// 	url: 'http://t0.tianditu.gov.cn/img_w/wmts?tk=' + mapConfig.tiandituKey,
		// 	layer: 'img',
		// 	style: 'default',
		// 	tileMatrixSetID: 'w',
		// 	format: 'tiles',
		// 	maximumLevel: 18
		// });

		//加载谷歌地图
		// this.addImageryProvider({
		//   loadType:"UrlTemplateImageryProvider",
		//   url:'http://www.google.cn/maps/vt?lyrs=s@800&x={x}&y={y}&z={z}',
		//   tilingScheme:new Cesium.WebMercatorTilingScheme(),            	
		//   minimumLevel:1,            
		//   maximumLevel:20 
		// });

		// 加载geoserver发布的wms地图服务--测试代码（需要配置tomcat跨域访问）
		let config = _this.Vue.$store.state.appConfig.ServerConfig;
		let layers = config.geoserverLayerGroup + config.baseLayers;
		_this.addGeoserverMap(layers, true);

	},

	/*添加image背景图
	 */
	addImageBackground: function () {
		var _this = this;
		let viewer = _this.viewer;
		var imageUrl = 'common/img/GlobalBkLayer.jpg';
		var bgimage = new Cesium.SingleTileImageryProvider({
			url: imageUrl,
			rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0)
		});
		viewer.scene.imageryLayers.addImageryProvider(bgimage);
		_this.OnlineMaps.push({
			obj: bgimage,
			url: imageUrl
		});
	},

	/*添加在线地图到球体
	 *@param: obj {Object} 地图服务对象（包含url及属性）  eg
	 * viewer.imageryLayers._layers中
	 */
	addImageryProvider: function (obj, index) {
		let viewer = this.viewer;
		var loadType = obj.loadType;
		var mapObj = null;
		if (loadType == "UrlTemplateImageryProvider") {
			mapObj = new Cesium.UrlTemplateImageryProvider(obj);
		} else if (loadType == "WebMapTileServiceImageryProvider") {
			mapObj = new Cesium.WebMapTileServiceImageryProvider(obj);
		} else if (loadType == "ArcGisMapServerImageryProvider") {
			mapObj = new Cesium.ArcGisMapServerImageryProvider(obj);
		} else if (loadType == "MapboxImageryProvider") {
			mapObj = new Cesium.MapboxImageryProvider(obj);
		} else if (loadType == "BingMapsImageryProvider") {
			mapObj = new Cesium.BingMapsImageryProvider(obj);
		} else if (loadType == "SingleTileImageryProvider") {
			mapObj = new Cesium.SingleTileImageryProvider(obj);
		} else if (loadType == "WebMapServiceImageryProvider") {
			mapObj = new Cesium.WebMapServiceImageryProvider(obj);
		} else { //DOM正元倾斜摄影
			mapObj = new Cesium.UrlTemplateImageryProvider(obj);
		}
		if (mapObj) {
			var oneLayer = viewer.scene.imageryLayers.addImageryProvider(mapObj, obj.index);
			oneLayer.alpha = this.TransparencyAlpha;
			this.OnlineMaps.push({
				obj: oneLayer,
				url: obj.url,
				isClear: obj.isClear
			});
			console.log(oneLayer, 'oneLayer');
			this.getDataByClickEvent(mapObj)
		}

	},

	/*添加三维图层（手工模型、地质体）
	 *@param: {String} 服务地址 eg:url:'http://172.30.17.112:8066/tileset.json' 【必选】
	 */
	addCesium3DTileset: function (url) {
		let viewer = this.viewer;
		let layerObj = new Cesium.Cesium3DTileset({
			url: url,
			// maximumScreenSpaceError:20,//最大的屏幕空间误差
			maximumMemoryUsage: 2560, //tileet可以使用的最大内存量,默认512（以MB为单位）。
			// immediatelyLoadDesiredLevelOfDetail:true,
			dynamicScreenSpaceError: true,
			dynamicScreenSpaceErrorFactor: 4,
			preloadWhenHidden: true
		});
		// this.change3DTilesetHeight(layerObj,0);//上下移动xx米
		let mapObj = viewer.scene.primitives.add(layerObj);
		this.Cesium3DTileDatas.push(mapObj);
		// this.setModalEntitiesStyle(true,mapObj);//临时设置模型样式
	},

	/*创建离线DEM
	 *@param:url {String}  dem服务地址  【必选】
	 *@param:checked {Bollean} 显示或移除地形 【必选】
	 */
	addCesiumTerrainProvider: function (url, checked) {
		var global = 'http://www.vr-theworld.com/vr-theworld/tiles1.0.0/73/';
		var tdtUrl = 'https://t{s}.tianditu.gov.cn/'; //服务域名
		if (checked) {
			if (url == global) {
				// var vrTheWorldProvider = new Cesium.VRTheWorldTerrainProvider({
				//   url : url,
				//   credit : 'Terrain data courtesy VT M?K',
				//   requestVertexNormals:true
				// });
				// });
				// this.viewer.terrainProvider = vrTheWorldProvider;
				this.addTianDiTuDEM();
			} else if (url == tdtUrl) {
				this.addTianDiTuDEM();
			} else {
				var isOnLine = this.Vue.index.isOnLine(url + "layer.desc");
				if (isOnLine) {
					this.viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
						url: url,
						requestVertexNormals: true
					});
				}
			}
		} else {
			this.removeAll_DEMLayer();
		}
	},

	/*天地图地形服务
	 */
	addTianDiTuDEM() {
		var _this = this;
		var tdtUrl = 'https://t{s}.tianditu.gov.cn/'; //服务域名
		var subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']; // 服务负载子域
		var terrainUrls = new Array();
		var token = _this.Vue.$store.state.mapConfig.tiandituKey;
		for (var i = 0; i < subdomains.length; i++) {
			var url = tdtUrl.replace('{s}', subdomains[i]) + 'DataServer?T=elv_c&tk=' + token;
			terrainUrls.push(url);
		}
		_this.viewer.terrainProvider = new Cesium.GeoTerrainProvider({
			urls: terrainUrls //['/DataServer?T=elv_c&tk='+token]
		});
	},

	/*添加arcgis server 发布的地图
	*@params:params {object} eg:{
		url:'',//arcgis server发布的动态地图服务 eg:"http//ip:6080/arcgis/rest/services/服务名/MapServer"  【必选】
		..... 其他参数【可选】
	}
	*/
	addArcgisMap(params) {
		let _this = this;
		let viewer = _this.viewer;
		if (params) {
			if (params.url != undefined && params.url != "") {
				var imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
					url: params.url,
				});
				viewer.imageryLayers.addImageryProvider(imageryProvider);

			}
		}
	},
	addLayersUrlMap(layersUrl) {
		let _this = this;
		let viewer = _this.viewer;
		var mapObj = new Cesium.WebMapServiceImageryProvider({
			url: layersUrl.url,
			//request:'GetLegendGraphic',
			layers: layersUrl.layers,
			//CRS:'EPSG:4326',
			parameters: {
				service: 'WMS',
				format: 'image/png',
				transparent: true
			}
		});
		if (mapObj) {
			var oneLayer = viewer.scene.imageryLayers.addImageryProvider(mapObj, layersUrl.index);
			oneLayer.alpha = _this.TransparencyAlpha;
			_this.OnlineMaps.push({
				obj: oneLayer,
				url: layersUrl.url,
				isClear: true,
			});
		}
		viewer.imageryLayers.addImageryProvider(oneLayer);
	},
	/*添加geoserver地图
	 *@param:layers {object} 一个或多个图层 eg:多个图层'CuData:pcu_tracts,pcu_deps_pros' 或者图层组 'CuData:CuData' 【必选】
	 *@param:isClear {boolean} 是否清除eg:true/false 【必选】
	 */
	addGeoserverMap(layers, isClear) {
		let _this = this;
		let geoUrl = _this.Vue.$store.state.appConfig.ServerConfig
			.geoserverWmsAddress; //'http://172.30.17.136:8080/geoserver/CuData/wms',//192.168.50.128
		_this.addImageryProvider({
			label: 'geoserver服务',
			loadType: "WebMapServiceImageryProvider",
			url: geoUrl,
			isClear: isClear,
			layers: layers ? layers : 'CuData:pcu_tracts,pcu_deps_pros',
			parameters: {
				service: 'WMS',
				format: 'image/png',
				transparent: true
			},
			proxy: new Cesium.DefaultProxy('/proxy/'),
			reday: true
		});

	},

	/*设置影像显隐性
	 *@param:is_show {bollean}  显示或隐藏 eg：true、fale 【必选】
	 *@param:m_obj {Object}  影像服务url  【必选】
	 */
	setVisibleImage: function (is_show, m_obj) {
		let _this = this;
		let viewer = _this.viewer;
		let SelectLayer = _this.getLayerImage(m_obj.url);
		if (SelectLayer != null) {
			viewer.imageryLayers._layers[SelectLayer].show = is_show;
		} else if (is_show) {
			_this.addImageryProvider(m_obj); //创建影像
		}
	},

	/*获得影像对象-根据url
	 *@param:m_url {String}  影像服务url  【必选】
	 */
	getLayerImage: function (m_url) {
		let _this = this;
		let viewer = _this.viewer;
		let imageryLayers = viewer.imageryLayers._layers;
		for (let i = 0; i < imageryLayers.length; i++) {
			if (imageryLayers[i]._imageryProvider.url == m_url)
				return i;
		}
		for (let j = 0; j < _this.OnlineMaps.length; j++) {
			if (_this.OnlineMaps[j].url == m_url)
				return j;
		}
		return null;
	},



	/************************************通用绘制移除销毁功能方法start（忘记变量，记住方法！！！）************************************

	/*1、（外调方法）将绘制对象存放在字典中，用于清除/重绘ww
			*说明：
					*@param: name {string} 绘制对象一级键名 【必选】
					*@param: obj {object} 绘制的对象(通过此方式viewer.entities.add(obj)或viewer.scene.primitives.add(obj)添加到球体上的对象) 【必选】
					示例：_this.addValueToDrawObjSet("PolygonObj",obj)
	*/
	addValueToDrawObjSet: function (name, obj) {
		var _this = this;
		var _drawObj = _this.Draw3DObjSet;
		if (!_drawObj[name]) {
			_drawObj[name] = [];
		}
		_drawObj[name].push(obj);
	},
	/*2、（外调方法）移除销毁一个或多个或所有存入此对象中【绘制对象】的操作ww
		*参数说明：此方法当前仅用于清除丢到_this.Draw3DObjSet中的绘制对象，如需清除其他请扩展，但是参数顺序不要变
		*@param: names {array} 可选 需要删除的对象名数组（不设置则移除全部） eg:[DrawLines,DrawPolygons]  【可选】
		*@param:flag {boolean} 是否同时将绘制对象数据从Draw3DObjSet中擦除( delete objs[key])  eg:true是,false否,不设置则默认为true  【可选】
		*@param:type {number} 添加图元方式eg:1、viewer.entities.add(obj) 2、viewer.scene.primitives.add(obj)....   【后续有需要待扩展参数】
		调用方式：
		*①清除所有绘制对象 _this.remove3DObj()
		*②清除单个或多个（默认擦除字典中此对象）_this.remove3DObj(["PolygonObj",""..]) 等价于 _this.remove3DObj(["PolygonObj",""..],true)
		*③清除单个或多个（不擦除，可用于重绘）_this.remove3DObj(["PolygonObj",""..],false)
	*/
	remove3DObj: function (names, flag, type) {
		var _this = this;
		var objs = _this.Draw3DObjSet;
		var renderType = (type == undefined) ? 1 : type;
		_this.remove3DObjs(names, flag, objs, function (obj) {
			if (renderType == 1) {
				_this.viewer.entities.remove(obj);
			} else if (renderType == 2) {
				_this.viewer.scene.primitives.remove(obj);
			}
		});
	},
	/*2-main、（内用方法）移除和销毁三维球绘制对象 (支持多种方式添加到球体的对象，采用回调方式清除）ww
	 *@param: names {arr} 可选 需要删除的对象名数组（不设置择移除全部） eg:[DrawLines,DrawPolygons]
	 *@param:flag:是否同时将绘制对象数据从objs中擦除( delete objs[key])  eg:true是,false否,不设置则默认为true
	 *@param:objs:获得此功能所有绘制对象
	 * return： 无
	 */
	remove3DObjs: function (names, flag, objs, removeCallback) {
		var _this = this;
		if (typeof (objs) == "object") {
			for (var key in objs) {
				if (typeof (names) == "object") {
					var num = 0;
					for (var i = 0; i < names.length; i++) {
						if (key == names[i]) {
							num++;
						}
					}
					if (num == 0) {
						continue;
					}
				}
				if (key == "makeClassify" || key == "clear" || key == "max" || key == "min") continue;;
				var obj = objs[key];
				if (typeof (obj) == 'object' && obj.length != undefined) {
					if (obj.length != 0) {
						for (var m = 0; m < obj.length; m++) {
							if (obj[m]) {
								if (obj[m].show != undefined) {
									obj[m].show = false;
								}
								if (typeof removeCallback == "function") {
									removeCallback(obj[m]);
								}
							}
						}
					} else {
						for (var key2 in obj) {
							if (typeof (obj[key2]) == "object") {
								if (obj[key2].show) {
									obj[key2].show = false;
								}
								if (typeof removeCallback == "function") {
									removeCallback(obj[key2]);
								}
							}
						}
					}
				} else {
					if (typeof (obj) == "object") {
						if (typeof removeCallback == "function") {
							removeCallback(obj);
						}
					}
				}
				if (flag == true || flag == undefined) {
					if (typeof (objs[key]) == "object") {
						delete objs[key];
					}
				}
			}
		}
	},
	/*3-（外调方法）判断绘制对象是否存在
	 *@param: labelName {string}对象名 eg:'DrawLines' 【必选】
	 *return:true存在、false不存在
	 */
	isExist3DObj: function (labelName) {
		var _this = this;
		var _drawObj = _this.Draw3DObjSet;
		var flag = false;
		if (_drawObj[labelName] && _drawObj[labelName].length > 0) {
			flag = true;
		}
		return flag;
	},
	/************************************通用绘制移除销毁功能方法end************************************

	/**********数据清除模块*********/
	/*移除图层（在线瓦片/canvas等值面等）
	@param: oneLayer {object}自定义的图层名
	*/
	remove_ImageLayers: function () {
		debugger
		var oneLayerArr = this.ImageLayerArr;
		for (var i = 0; i < oneLayerArr.length; i++) {
			if (this.viewer && this.viewer.imageryLayers) {
				this.viewer.imageryLayers.remove(oneLayerArr[i]);
			}
		}
		this.ImageLayerArr = [];
	},

	/*移除所有图层（在线瓦片）
	 */
	removeAll_ImageLayers: function () {
		if (this.viewer && this.viewer.imageryLayers) {
			this.viewer.imageryLayers.removeAll();
		}
		this.OnlineMaps = []; //在线地图
	},
	/*移除单个图层(1、仅清除非当前url底图。2、仅清除geoserver图层)
	 *@param:url {string} 当前图层url，如果未定义则清除geoserver图层【必选】
	 */
	remove_ImageLayer: function (url) {
		let _this = this;
		if (_this.OnlineMaps.length > 0) {
			let d_index = [];
			$.each(_this.OnlineMaps, function (i, item) {
				let code = (item && item.url != undefined) ? item.url.indexOf("geoserver") : -1;
				if (url == undefined && code != -1 && item.isClear != false) { //仅清除geoserver图层  
					_this.viewer.imageryLayers.remove(item.obj);
					d_index.push(i);
				} else if (url != undefined && item.url != url && (code == -
					1)) { //清除非geoserver及非当前url图层(底图)
					_this.viewer.imageryLayers.remove(item.obj);
					d_index.push(i);
				} else if (url == undefined && code == -1 && item.isClear ==
					true) { //清除非geoserver图层,isClear==true的图层
					_this.viewer.imageryLayers.remove(item.obj);
					d_index.push(i);
				}
			});
			for (let j = d_index.length - 1; j >= 0; j--) {
				_this.OnlineMaps.splice(j, 1);
			}
		}
	},

	/*移除所有模型（除去管线外的数据，包括DOM、模型等）
	 */
	removeAll_3DTileset: function () {
		var _this = this;
		var objs = _this.Cesium3DTileDatas;
		for (var i = 0; i < objs.length; i++) {
			var obj = objs[i];
			if (typeof (obj) == "object") {
				_this.viewer.scene.primitives.remove(obj);
			}
		}
		_this.Cesium3DTileDatas = [];
	},

	/*移除所有DEM
	 */
	removeAll_DEMLayer: function () {
		if (this.viewer) {
			this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider({});
		}
	},

	/*移除所有json数据图层（管线、影像、模型）*/
	removeAll_3DTilesetLayers: function () {
		this.removeAll_3DTileset();
	},

	/*移除所有图层
	 */
	removeAll: function () {
		this.removeAll_ImageLayers(); //移除在线地图
		this.removeAll_3DTilesetLayers(); //移除3DTileset图层
		this.removeAll_DEMLayer(); //移除离线DEM
	},

	/*清除绘制图元（按照ID）
	 * 此方法暂未使用，后期可根据需求适当修改
	 */
	removeById: function (ids) {
		let viewer = this.viewer;
		viewer.scene.globe.depthTestAgainstTerrain = false;
		viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType
			.LEFT_DOUBLE_CLICK);
		var clearS = viewer.entities.values;
		for (var i = 0; i < clearS.length; i++) {
			//if (clearS[i]._name == 'scirle' ||clearS[i]._name == 'rectangle' || clearS[i]._name == 'pointer') {
			console.log(clearS[i])
			viewer.entities.removeById(clearS[i]._id)
			//}
		}
	},
	/*移除绘制要素
	 */
	removeDrawFeature: function () {
		let _this = this;
		let viewer = _this.viewer;
		for (let i = 0; i < this.FeatureDataSet.length; i++) {
			if ((this.FeatureDataSet[i]) instanceof Cesium.Entity) {
				this.viewer.entities.remove(this.FeatureDataSet[i]);
			} else if ((this.FeatureDataSet[i]) instanceof Cesium.Primitive) {
				this.viewer.scene.primitives.remove(this.FeatureDataSet[i]);
				this.FeatureDataSet[i].destroy();
			} else if ((this.FeatureDataSet[i]) instanceof Cesium.ApertureEffect) {
				this.viewer.entities.remove(this.FeatureDataSet[i].apertureEntity);
			} else if ((this.FeatureDataSet[i]) instanceof Cesium.ParticleSystem) { //粒子效果
				this.FeatureDataSet[i].destroy();
			} else if ((this.FeatureDataSet[i]) instanceof Cesium.ProjectVideoPrimitive) {
				this.viewer.scene.primitives.remove(this.FeatureDataSet[i]);
				this.FeatureDataSet[i].destroy();
			}
		}
		this.FeatureDataSet = [];
	},
	/*清除鼠标事件（单机双击等操作）
	 */
	clearHandler: function () {
		var handle = this.ClickHandler;
		if (handle != null) {
			handle.destroy();
			handle = null;
		}
	},

	/*场景复原（仅清屏事件调用）
	 */
	sceneRecovery() {
		this.clearScreen();
		this.setLayerOpcity(1);
	},

	/*清屏（清除图元，窗体等，不修改透明度）
	 */
	clearScreen: function () {
		try {
			$("#BubbleDivr").css({
				opacity: 0,
				"z-index": 0
			}); //气泡
			this.viewer.entities.removeAll(); //清除常见图形绘制
			this.viewer.scene.postProcessStages.removeAll(); //移除雨雪效果
			this.viewer.scene.globe.material = null;
			this.viewer.scene.globe.depthTestAgainstTerrain = true; // 深度检测
			this.removeDrawFeature(); //清除绘制的点线面等要素//比较齐全类型
			this.remove_ImageLayers(); //清除等值线等canvas绘制的底层非影像图层
			this.remove3DObj(); //清除新绘制方法字典中对象
		} catch (e) { }
	},
	/****************数据清除模块*******************/



	/****************Cesium接口使用模块/****************/
	/*设置影像透明度
	 */
	setLayerOpcity: function (val) {
		let viewer = this.viewer;
		if (val < 1) {
			// viewer.scene.globe.translucency.enabled = true;//平台参数
			viewer.scene.globe.depthTestAgainstTerrain = false;
		} else {
			// viewer.scene.globe.translucency.enabled = false;
			viewer.scene.globe.depthTestAgainstTerrain = true; // 深度检测
		}
		//设置透明度
		if (viewer.imageryLayers) {
			for (var i = 0; i < viewer.imageryLayers.length; i++) {
				viewer.imageryLayers.get(i).alpha = val;
			}
		}
		this.TransparencyAlpha = val;
		/* 模型透明度----此功能可用，但是模型不需要透明，暂时屏蔽（周20190306修改意见）*/
		//  if (this.Cesium3DTileDatas){
		//     for (var j = 0; j < this.Cesium3DTileDatas.length; j++) {
		//       this.Cesium3DTileDatas[j].style = new Cesium.Cesium3DTileStyle({
		//         color: "color('rgba(255,255,255,"+val+")')"
		//       });
		//     }
		//   }
	},

	/*三维场景截屏(球体)
	*@param:params {object} 参数集合 【可选】
						eg:
						{
							name:"文件名",
							width:"图片宽度",
							height:"图片高度",
							....
						}
	*@param:callback {function} 回调函数 【可选】
	*/
	sceneScreenshot(params, callback) {
		let _this = this;
		let viewer = _this.viewer;
		var fileName = '截图' + this.Vue.index._getCurrentDataTime();
		var canvas = viewer.scene.canvas;
		var imageWidth = canvas.width;
		var imageHeight = canvas.height;
		if (params) {
			if (params.name) fileName = params.name;
			if (params.width) imageWidth = params.width;
			if (params.height) imageHeight = params.height;
		}
		var img = this.Vue.canvas2Image.convertToImage(canvas, imageWidth, imageHeight, 'png');
		var loadImg = document.createElement('a')
		loadImg.href = img.src
		loadImg.download = fileName;
		loadImg.click();
	},
	/*改变3D Tiles位置（当前仅限高度移动）
	 */
	change3DTilesetHeight: function (tileset, height) {
		height = Number(height);
		if (isNaN(height)) {
			return;
		}
		var translation = Cesium.Cartesian3.fromArray([0, 0, height]);
		var mmm = Cesium.Matrix4.fromTranslation(translation); //移动矩阵
		tileset._modelMatrix = mmm;
	},

	/*抬升管线）（调整模型）
	 *@tileset {Object} 模型对象 【必选】
	 *@height {number} 抬升（偏移高度值） 【必选】
	 */
	ajustPipeHeight: function (tileset, height) {
		var boundingSphere = tileset.boundingSphere;
		var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
		var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
		var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
		var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
		tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
	},

	/*改变模型颜色
	 */
	change3DTileseColoe: function (tileset) {
		tileset.style = new Cesium.Cesium3DTileStyle({
			color: {
				conditions: [
					['${Height} >= 100', 'color("purple", 0.5)'],
					['${Height} >= 50', 'color("red")'],
					['true', 'color("blue")']
				]
			},
			show: '${Height} > 0',
			meta: {
				description: '"Building id ${id} has height ${Height}."'
			}
		});
	},

	/*设置模型渲染颜色-测试北京矢量拉体白膜设置颜色
	 *@param:type {sting} 【必选】
	 *@param:objObj {object} 【必选】
	 */
	setModalEntitiesStyle: function (type, objObj) {
		var url = objObj.url;
		if (objObj) {
			var conditions = [
				["${floor} === '6'", "color('purple', 1)"],
				["${floor}=== '5'", "color('red',1)"],
				["${floor} === '4'", "color('orange',1)"],
				["${floor} === '3'", "color('yellow',1)"],
				["${floor} === '2'", "color('lime',1)"],
				["${floor} === '1'", "color('cyan',1)"],
				["true", "color('blue')"],
			];
			if (type == true && (url.indexOf("sllst") != -1 || url.indexOf("beijing") != -1)) {
				objObj.style = new Cesium.Cesium3DTileStyle({
					color: {
						// conditions: [
						//     ["${floor} === '1'", "rgba(220,20,60, 1)"]
						//     ["true", "rgb(127, 59, 8)"]
						// ]
						conditions: conditions,
					}
				});
			}
		}
	},

	/*获得模型对象(根据经纬度坐标)
	 *@param:lon {number} 经度 【必选】
	 *@param:lat {number} 纬度 【必选】
	 *@param:height {number} 高程 【必选】
	 *eg:106.0426993895877,29.838336937494667,282.2288944768103
	 *return:{object}
	 */
	getModelObjByLonLat: function (lng, lat, height) {
		let _this = this;
		let viewer = _this.viewer;
		var cartographic = Cesium.Cartographic.fromDegrees(lng, lat, height); //经纬度坐标转地理坐标（弧度）
		var cartesian3 = viewer.scene.globe.ellipsoid.cartographicToCartesian(cartographic); //地理坐标（弧度）转世界坐标
		var windowCoord = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian3); //世界坐标转屏幕坐标
		var pickingEntity = viewer.scene.pick(windowCoord); //{x:566,y:455}
		return pickingEntity;
	},

	/*获得当前屏幕范围内的中心点
	 */
	getCenter: function () {
		let _this = this;
		let viewer = _this.viewer;
		var rectangle = viewer.camera.computeViewRectangle();
		var west = rectangle.west / Math.PI * 180;
		var north = rectangle.north / Math.PI * 180;
		var east = rectangle.east / Math.PI * 180;
		var south = rectangle.south / Math.PI * 180;
		var centerx = (west + east) / 2;
		var cnetery = (north + south) / 2;
		return {
			X: centerx,
			Y: cnetery
		};
	},

	/*获得当前屏幕范围内的姿态
	 */
	getDirection() {
		let _this = this;
		let viewer = _this.viewer;
		var direction = viewer.camera._direction;
		var x = Cesium.Math.toDegrees(direction.x);
		var y = Cesium.Math.toDegrees(direction.y);
		var z = Cesium.Math.toDegrees(direction.z);
		return {
			X: x,
			Y: y,
			Z: z
		};
	},

	/*获取经纬度下2点之间的距离
	 *@param:lng1 {number} 起点经度 eg:117.270739 【必选】
	 *@param:lat1 {number} 起点纬度 eg:31.84309【必选】
	 *@param:lng2 {number} 终点经度 eg:117.270739【必选】
	 *@param:lat2 {number} 终点纬度 eg:31.85309【必选】
	 */
	getDistance(lng1, lat1, lng2, lat2) {
		var satrt = Cesium.Cartographic.fromDegrees(lng1, lat1);
		var end = Cesium.Cartographic.fromDegrees(lng2, lat2);
		var geodesic = new Cesium.EllipsoidGeodesic();
		geodesic.setEndPoints(satrt, end);
		var distance = geodesic.surfaceDistance;
		return {
			distance,
			geodesic
		}
	},

	/*获得两点之间的方向（待验证）
		*@param:startLat {number} 起点经度 【必选】
		*@param:startLng {number} 起点纬度【必选】
		*@param:destLat {number} 终点经度 【必选】
		*@param:destLng {number} 终点纬度 【必选】
		return:角度
	*/
	getHeading(lng1, lat1, lng2, lat2) {
		var startLng = Cesium.Math.toRadians(lng1);
		var startLat = Cesium.Math.toRadians(lat1);
		var destLng = Cesium.Math.toRadians(lng2);
		var destLat = Cesium.Math.toRadians(lat2);
		var y = Math.sin(destLng - startLng) * Math.cos(destLat);
		var x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng -
			startLng);
		var brng = Math.atan2(y, x);
		var brngDgr = Cesium.Math.toDegrees(brng);
		var heading = (brngDgr + 360) % 360;
		return heading;
	},

	/*根据【一点坐标(观察点)+方向+距离】计算目标点
	 *@param:lon {number} 经度 eg:117.66【必选】
	 *@param:lat {number} 维度 eg:36.12 【必选】
	 *@param:height {number} 高度 eg:19.634【必选】
	 *@param:direction {number} 方向（弧度）eg:Math.PI/2 【必选】
	 *@param:radius {number} 可视距离(m) 500【必选】
	 */
	getCalculatingTargetPoint(lon, lat, height, direction, radius) {
		var viewPoint = Cesium.Cartesian3.fromDegrees(lon, lat, height);
		var webMercatorProjection = new Cesium.WebMercatorProjection(this.viewer.scene.globe.ellipsoid); // 世界坐标转换为投影坐标
		var viewPointWebMercator = webMercatorProjection.project(Cesium.Cartographic.fromCartesian(viewPoint));
		var toPoint = new Cesium.Cartesian3(viewPointWebMercator.x + radius * Math.cos(direction), viewPointWebMercator
			.y + radius * Math.sin(direction), height); // 计算目标点
		//投影坐标转世界坐标
		toPoint = webMercatorProjection.unproject(toPoint);
		toPoint = Cesium.Cartographic.toCartesian(toPoint.clone());
		//世界坐标转地理坐标
		var cartographic = Cesium.Cartographic.fromCartesian(toPoint);
		var ptx = Cesium.Math.toDegrees(cartographic.longitude);
		var pty = Cesium.Math.toDegrees(cartographic.latitude);
		var ptz = cartographic.height;
		var point = {
			X: ptx,
			Y: pty,
			Z: ptz
		};
		return point;
	},

	/*获得当前视图经纬度范围
	 *return:范围对象（当canvas左上和右下角全部在椭球体上时实用）
	 *调用:重庆干管分布、
	 */
	getViewExtent() {
		let _this = this;
		let viewer = _this.viewer;
		var scene = viewer.scene; // 当前三维场景
		var ellipsoid = scene.globe.ellipsoid; // 当前三维场景的椭球体
		var canvas = scene.canvas; //球体画布
		var pt1 = new Cesium.Cartesian2(0, 0);
		var pt2 = new Cesium.Cartesian2(canvas.width, canvas.height);
		var pick1 = viewer.scene.globe.pick(viewer.camera.getPickRay(pt1), viewer.scene);
		var pick2 = viewer.scene.globe.pick(viewer.camera.getPickRay(pt2), viewer.scene);
		//三维坐标转成地理坐标
		var geoPt1 = ellipsoid.cartesianToCartographic(pick1);
		var geoPt2 = ellipsoid.cartesianToCartographic(pick2);
		//地理坐标转换为经纬度坐标
		var lt_Point = [geoPt1.longitude / Math.PI * 180, geoPt1.latitude / Math.PI * 180];
		var rb_Point = [geoPt2.longitude / Math.PI * 180, geoPt2.latitude / Math.PI * 180];
		return {
			xmin: lt_Point[0],
			ymax: lt_Point[1],
			xmax: rb_Point[0],
			ymin: rb_Point[1],
			height: Math.ceil(viewer.camera.positionCartographic.height)
		}
	},

	/*获得当前场景范围坐标-来源网络（待验证）
	 */
	getSceneExtent() {
		let _this = this;
		let viewer = _this.viewer;
		// 范围对象
		var extent = {};
		// 得到当前三维场景
		var scene = viewer.scene;
		// 得到当前三维场景的椭球体
		var ellipsoid = scene.globe.ellipsoid;
		var canvas = scene.canvas;
		// canvas左上角
		var car3_lt = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(0, 0), ellipsoid);
		// canvas右下角
		var car3_rb = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(canvas.width, canvas.height), ellipsoid);
		// 当canvas左上角和右下角全部在椭球体上
		if (car3_lt && car3_rb) {
			var carto_lt = ellipsoid.cartesianToCartographic(car3_lt);
			var carto_rb = ellipsoid.cartesianToCartographic(car3_rb);
			extent.xmin = Cesium.Math.toDegrees(carto_lt.longitude);
			extent.ymax = Cesium.Math.toDegrees(carto_lt.latitude);
			extent.xmax = Cesium.Math.toDegrees(carto_rb.longitude);
			extent.ymin = Cesium.Math.toDegrees(carto_rb.latitude);
		} else if (!car3_lt && car3_rb) { // 当canvas左上角不在但右下角在椭球体上
			var car3_lt2 = null;
			var yIndex = 0;
			do { // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
				yIndex <= canvas.height ? yIndex += 10 : canvas.height;
				car3_lt2 = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(0, yIndex), ellipsoid);
			} while (!car3_lt2);
			var carto_lt2 = ellipsoid.cartesianToCartographic(car3_lt2);
			var carto_rb2 = ellipsoid.cartesianToCartographic(car3_rb);
			extent.xmin = Cesium.Math.toDegrees(carto_lt2.longitude);
			extent.ymax = Cesium.Math.toDegrees(carto_lt2.latitude);
			extent.xmax = Cesium.Math.toDegrees(carto_rb2.longitude);
			extent.ymin = Cesium.Math.toDegrees(carto_rb2.latitude);
		} else if (car3_lt && !car3_rb) { // 当canvas左上角在但右下角不在椭球体上
			var car3_rb2 = null;
			var yIndex = canvas.height;
			var xIndex = canvas.width;
			do { // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
				yIndex >= 10 ? yIndex -= 10 : 10;
				xIndex >= 10 ? xIndex -= 10 : 10;
				car3_rb2 = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(yIndex, yIndex), ellipsoid);
			} while (!car3_rb2);
			var carto_lt2 = ellipsoid.cartesianToCartographic(car3_lt);
			var carto_rb2 = ellipsoid.cartesianToCartographic(car3_rb2);
			extent.xmin = Cesium.Math.toDegrees(carto_lt2.longitude);
			extent.ymax = Cesium.Math.toDegrees(carto_lt2.latitude);
			extent.xmax = Cesium.Math.toDegrees(carto_rb2.longitude);
			extent.ymin = Cesium.Math.toDegrees(carto_rb2.latitude);
		} else if (!car3_lt && !car3_rb) {
			var car3_lt2 = null;
			var yIndex = 0;
			var xIndex = 0;
			do { // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
				yIndex <= canvas.height ? yIndex += 10 : canvas.height;
				xIndex <= canvas.width ? xIndex += 10 : canvas.width;
				car3_lt2 = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(xIndex, yIndex), ellipsoid);
			} while (!car3_lt2);
			var car3_rb2 = null;
			var yIndex = canvas.height;
			var xIndex = canvas.width;
			do { // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
				yIndex >= 10 ? yIndex -= 10 : 10;
				xIndex >= 10 ? xIndex -= 10 : 10;
				car3_rb2 = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(yIndex, yIndex), ellipsoid);
			} while (!car3_rb2);

			var carto_lt2 = ellipsoid.cartesianToCartographic(car3_lt2);
			var carto_rb2 = ellipsoid.cartesianToCartographic(car3_rb2);
			extent.xmin = Cesium.Math.toDegrees(carto_lt2.longitude);
			extent.ymax = Cesium.Math.toDegrees(carto_lt2.latitude);
			extent.xmax = Cesium.Math.toDegrees(carto_rb2.longitude);
			extent.ymin = Cesium.Math.toDegrees(carto_rb2.latitude);
		}
		// 获取高度
		extent.height = Math.ceil(viewer.camera.positionCartographic.height);
		return extent;
	},

	/*获得当前相机姿态及方位信息
	 */
	getCameraData() {
		var viewer = this.viewer;
		var dircartographic = viewer.scene.camera.positionCartographic;
		//相机姿态
		var camerax = Cesium.Math.toDegrees(dircartographic.longitude).toFixed(6);
		var cameray = Cesium.Math.toDegrees(dircartographic.latitude).toFixed(6);
		var cameraz = dircartographic.height.toFixed(2);
		//相机方位
		var heading = Cesium.Math.toDegrees(viewer.scene.camera.heading);
		var pitch = Cesium.Math.toDegrees(viewer.scene.camera.pitch);
		var roll = Cesium.Math.toDegrees(viewer.scene.camera.roll);
		return {
			X: parseFloat(camerax),
			Y: parseFloat(cameray),
			Z: parseFloat(cameraz),
			heading: heading,
			pitch: pitch,
			roll: roll
		};
	},

	/*获得经纬度(根据拾取的单个镜头坐标)
	 *@param:cartesian {object} 左键点击 【必选】
	 *@param:isGround {bollean} 是否将高程替换为地面高程true、地表附着物false eg:true/false 【可选】
	 *@param:offsetZ {number} 高程增加值（单位米，使用此参数必须设置第二个参数） eg:2  【可选】
	 */
	getLonLatByPosition: function (cartesian, isGround, offsetZ) {
		var _this = this;
		// var ray = viewer.camera.getPickRay(click.position)
		// var cartesian = viewer.scene.globe.pick(ray, viewer.scene)
		var position = Cesium.Cartographic.fromCartesian(cartesian)
		var lon = Cesium.Math.toDegrees(position.longitude);
		var lat = Cesium.Math.toDegrees(position.latitude);
		var alt = Cesium.Math.toDegrees(position.height);
		if (isGround == true) {
			if (offsetZ == undefined) offsetZ = 0;
			alt = _this.getGroundHeight(lon, lat) + offsetZ; //比地面稍微高点，避免地形遮盖
		} else if (isGround == false) {
			let h = _this.getGroundAttrHeight(lon, lat);
			if (h == undefined) //如果获取不到地表附着物，选取地表高度
				alt = _this.getGroundHeight(lon, lat) + offsetZ; //比地面稍微高点，避免地形遮盖
			else
				alt = h + offsetZ; //地表附着物
		}
		return {
			X: lon,
			Y: lat,
			Z: alt
		};
	},

	/*获得镜头坐标(根据经纬度坐标)
	 */
	getPositionByLonLat: function (longitude, latitude, height) {
		return Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
	},

	/*根据坐标获得地表高程(经纬度)
	 *@param:lon {number} 经度 【必选】
	 *@param:lat {number} 纬度 【必选】
	 */
	getGroundHeight: function (lon, lat) {
		let viewer = this.viewer;
		var carto = new Cesium.Cartographic.fromDegrees(lon, lat);
		var alt = viewer.scene.globe.getHeight(carto);
		return alt;
	},

	/*根据坐标获取地表附着物高程(经纬度)
	 *@param:lon {number} 经度 【必选】
	 *@param:lat {number} 纬度 【必选】
	 */
	getGroundAttrHeight: function (lon, lat) {
		let viewer = this.viewer;
		var carto = new Cesium.Cartographic.fromDegrees(lon, lat);
		var alt = viewer.scene.sampleHeight(carto);
		return alt;
	},


	/*绘制文字标记
	*params {object} 参数集合
			eg:{
					X:117,         【必选】
					Y:36,          【必选】
					Z:23,          【必选】
					text:'热力管线',【必选】
					......         【可选】
			}
		*调用方式：this.Earth.drawLabel({X:x,Y:y,Z:z,text:“标注文字”});
	*/
	drawLabel: function (params) {
		let _this = this;
		let viewer = _this.viewer;
		if (!params) return;
		var longitude = params.X;
		var latitude = params.Y;
		var height = params.Z + 1;
		var text = params.text;
		let font = '16px Helvetica';
		let heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
		if (params.font != undefined) font = params.font;
		if (params.heightReference != undefined) heightReference = params.heightReference;
		var labelName = "labelObj";
		if (params.labelName != undefined) {
			labelName = params.labelName;
		}
		if (params.clear == true) {
			_this.remove3DObj([labelName]);
		}
		if (longitude != undefined && latitude != undefined && height != undefined && text != undefined) {
			var label = new Cesium.Entity({
				position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
				name: params.name ? params.name : 'label',
				label: {
					heightReference: heightReference,
					text: text,
					font: font,
					fillColor: params.fillColor ? params.fillColor : Cesium.Color.YELLOW, //SKYBLUE
					pixeloffset: params.pixeloffset ? params.pixeloffset : new Cesium.Cartesian2(0, 0),
					outlineColor: Cesium.Color.BLACK,
					outlineWidth: 2,
					style: Cesium.LabelStyle.FILL_AND_OUTLINE,
					verticalOrigin: Cesium.VerticalOrigin.TOP,
					disableDepthTestDistance: params.disableDepthTestDistance != undefined ? params
						.disableDepthTestDistance : Number.POSITIVE_INFINITY,
					scaleByDistance: params.scaleByDistance != undefined ? params.scaleByDistance : new Cesium.NearFarScalar(100,
						1.0, 200, 0.4),
					distanceDisplayCondition: params.distanceDisplayCondition != undefined ? params
						.distanceDisplayCondition : new Cesium.DistanceDisplayCondition(0.0,
							100000.0) //0-10000米范围内可见
				}
			});
			var labelObj = viewer.entities.add(label);
			_this.addValueToDrawObjSet(labelName, labelObj);
			if (params.zoom) {
				viewer.zoomTo(viewer.entities);
			}
		}
	},
	/*绘制点
	*params {object} 参数集合
			eg:{
					X:117,   【必选】
					Y:36,    【必选】
					Z:23,    【必选】
					......   【可选】
			}
	*调用方式：this.Earth.drawPoint({X:x,Y:y,Z:z});
	*/
	drawPoint: function (params) {
		let _this = this;
		let viewer = _this.viewer;
		if (!params) return;
		var longitude = params.X;
		var latitude = params.Y;
		var height = params.Z;
		var labelName = "labelObj";
		if (params.labelName != undefined) {
			labelName = params.labelName;
		}
		if (params.clear == true) {
			_this.remove3DObj([labelName]);
		}
		if (longitude != undefined && latitude != undefined && height != undefined) {
			var position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
			var point = {
				color: params.color != undefined ? params.color : Cesium.Color.SKYBLUE,
				pixelSize: params.pixelSize != undefined ? params.pixelSize : 20,
				outlineColor: params.outlineColor != undefined ? params.outlineColor : Cesium.Color.RED,
				outlineWidth: params.outlineWidth != undefined ? params.outlineWidth : 3,
				disableDepthTestDistance: params.disableDepthTestDistance != undefined ? params
					.disableDepthTestDistance : Number.POSITIVE_INFINITY
			};
			var point = new Cesium.Entity({
				position: position,
				name: 'point',
				point: point,
			});
			var pointObj = viewer.entities.add(point);
			_this.addValueToDrawObjSet(labelName, pointObj);
			if (params.zoom) {
				viewer.zoomTo(viewer.entities);
			}
		}
	},
	/*绘制图标
	 *params {object} 参数集合
			 eg:{
					 X:117,   【必选】
					 Y:36,    【必选】
					 Z:23,    【必选】
					 imgUrl:'../../../../static/UnderSpaceSystem/img/drawIcon/monitor_red.png',    【必选】
					 width:10,    宽【可选】
					 height:10,   高【可选】
					 OffsetX:0,    偏移量【可选】
					 OffsetY:0,    偏移量【可选】
					 zoom:true,    是否定位【可选】
					 clear:true,  是否清除上一个实体
					 ......   【可选】
			 }
	 *调用方式：this.Earth.drawPoint({X:x,Y:y,Z:z});
	 */
	drawIcon: function (params) {
		let _this = this;
		let viewer = _this.viewer;
		if (!params) return;
		let longitude = params.X;
		let latitude = params.Y;
		let height = params.Z;
		let imgUrl = params.imgUrl;
		let w = params.width ? params.width : 10;
		let h = params.height ? params.height : 10;
		let OffsetX = params.OffsetX ? params.OffsetX : 0;
		let OffsetY = params.OffsetY ? params.OffsetY : 0;
		let properties = params.properties ? params.properties : null;
		let heightReference = Cesium.HeightReference.CLAMP_TO_GROUND; //默认固定在地形上
		var labelName = "iconObj";
		if (params.labelName != undefined) {
			labelName = params.labelName;
		}
		if (params.clear == true) { //为避免破坏之前的使用，此处屏蔽
			_this.remove3DObj([labelName]);
		}
		if (params.heightReference != undefined) heightReference = params.heightReference;
		if (longitude != undefined && latitude != undefined && height != undefined) {
			let position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
			var itemdata = {
				position: position,
				name: params.name ? params.name : 'point',
				properties: properties,
				billboard: {
					heightReference: heightReference,
					image: imgUrl, //"../../../../static/UnderSpaceSystem/img/drawIcon/monitor_red.png",
					width: w,
					height: h,
					pixelOffset: new Cesium.Cartesian2(OffsetX, OffsetY) //偏移量
				},
				label: {
					heightReference: heightReference,
					text: params.text ? params.text : "",
					font: params.font ? params.font : '32px Helvetica',
					fillColor: Cesium.Color.RED, //SKYBLUE
					outlineColor: Cesium.Color.BLACK,
					outlineWidth: 2,
					style: Cesium.LabelStyle.FILL_AND_OUTLINE,
					verticalOrigin: Cesium.VerticalOrigin.TOP,
					scaleByDistance: new Cesium.NearFarScalar(100, 1.0, 200, 0.4)
				}
			};
			if (params.id != undefined && params.id != "") {
				itemdata.id = params.id;
				if (params.clear == true) {
					viewer.entities.removeById(params.id); //清除上一个实体
				}
			}
			if (params.label != undefined && params.label != "") {
				itemdata.label = params.label;
			}
			let point = new Cesium.Entity(itemdata);
			var iconObj = viewer.entities.add(point);
			this.addValueToDrawObjSet(labelName, iconObj);
			if (params.zoom) {
				viewer.zoomTo(viewer.entities);
			}
		}
	},
	/*绘制线
	*params {object} 参数集合
			eg:{
					points:[{X:117,Y:36,Z:23},{X:117,Y:35,Z:23},.....],   【必选】
					labelName:'pipelineObj', //对象标记(用于清除方便) 【可选】
					clear：true,//是否清除上一个（默认false不清除） eg:true、false 【可选】
					zoom:true,//是否定位对象(默认不定位) eg:true、false 【可选】
					......           【可选】
			}
		*调用方式：this.Earth.drawPolyLine({points:[{X:117,Y:36,Z:23},{X:117,Y:35,Z:23},.....]);
	*/
	drawPolyLine: function (params) {
		let viewer = _this.viewer;
		var _this = this;
		if (!params) return;
		var points = params.points;
		if (points && points.length > 1) {
			var positions = [];
			for (var i = 0; i < points.length; i++) {
				if (points[i].X != undefined && points[i].Y != undefined && points[i].Z != undefined) {
					var position = Cesium.Cartesian3.fromDegrees(points[i].X, points[i].Y, points[i].Z);
					if (position) {
						positions.push(position);
					}
				}
			}
			var labelName = "polylineObj";
			if (params.labelName != undefined) {
				labelName = params.labelName;
			}
			if (params.clear == true) {
				_this.remove3DObj([labelName]);
			}
			var polyline = viewer.entities.add({
				name: 'polyline',
				polyline: {
					positions: positions,
					//在地形上绘制多段线，但是在3dtilset模型上无效
					clampToGround: true, //1.60cesium需要改为false
					// followSurface : false,
					material: params.material ? params.material : Cesium.Color.RED,
					strokeWidth: params.strokeWidth ? params.strokeWidth : undefined,
					stroke: params.stroke ? params.stroke : undefined,
					markerSymbol: params.markerSymbol ? params.markerSymbol : undefined,
					width: params.width ? params.width : 3,
				}
			});
			_this.addValueToDrawObjSet(labelName, polyline);
			if (params.zoom) {
				viewer.zoomTo(viewer.entities);
			}
			if (params.zoom2) {
				_this.FlyToPoints(points);
			}
		}
	},
	/*绘制面
	 *params {object} 参数集合
			eg:{
					points:[{X:117,Y:36,Z:23},{X:117,Y:35,Z:23},.....],   【必选】
					labelName:'pipegonObj', //对象标记(用于清除方便) 【可选】
					clear：true,//是否清除上一个（默认false不清除） eg:true、false【可选】
					zoom:true,//是否定位对象(默认不定位) eg:true、false 【可选】
					id:'',//对象id，可用于匹配，需要保持唯一性 【可选】
					......可扩展参数(如有需要可转参)           【可选】
			}
		*调用方式：this.Earth.drawPolygon({points:[{X:117,Y:36,Z:23},{X:117,Y:35,Z:23},.....]);
	*/
	drawPolygon: function (params) {
		var _this = this;
		let viewer = _this.viewer;
		if (!params) return;
		var labelName = "polygonObj";
		if (params.labelName != undefined) {
			labelName = params.labelName;
		}
		if (params.clear == true) {
			_this.remove3DObj([labelName]);
		}
		var points = params.points;
		if (points && points.length > 1) {
			var positions = [];
			for (var i = 0; i < points.length; i++) {
				if (points[i].X != undefined && points[i].Y != undefined && points[i].Z != undefined) {
					var position = Cesium.Cartesian3.fromDegrees(points[i].X, points[i].Y, points[i].Z);
					if (position) {
						positions.push(position);
					}
				}
			}
			var option = {
				name: params.name != undefined ? params.name : "polygon",
				polygon: {
					hierarchy: positions,
					material: params.material != undefined ? params.material : Cesium.Color.GREEN.withAlpha(
						0.5),
					// outline : true,
					// outlineWidth: 2,
					// outlineColor : Cesium.Color.RED,
					// height: params.height!=undefined?params.height:10,
					heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
				}
			};
			if (params.id != undefined) option.id = params.id;
			/***待扩展参数*****/
			var polygon = viewer.entities.add(option);
			this.addValueToDrawObjSet(labelName, polygon);
			if (params.zoom) {
				viewer.zoomTo(viewer.entities);
			}
			if (params.zoom2) {
				_this.FlyToPoints(points);
			}
		}
	},


	/*绘制矩形-测试
	 */
	drawRectangle: function (params) {
		let _this = this;
		let viewer = _this.viewer;
		var instance = new Cesium.GeometryInstance({
			geometry: new Cesium.RectangleGeometry({
				rectangle: Cesium.Rectangle.fromDegrees(100.0, 30.0, 110.0, 40.0)
			}),
			id: 'rectangle1',
			attributes: {
				color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
			}
		});

		var rectangle = new Cesium.Primitive({
			geometryInstances: instance,
			appearance: new Cesium.PerInstanceColorAppearance()
		});
		viewer.scene.primitives.add(rectangle);

		viewer.zoomTo(viewer.entities);
	},

	/*绘制圆锥(圆柱)体-测试
	 *@params:{object} 可扩展参数【必选】
	 */
	drawCylinderCone: function (params) {
		let _this = this;
		let viewer = _this.viewer;
		if (params && params.x != undefined && params.y != undefined && params.z != undefined) {
			var cylinder = {
				length: 1,
				topRadius: 0.0,
				bottomRadius: 0.2,
				material: Cesium.Color.GREEN.withAlpha(0.5),
				outline: true, //轮廓
				outlineColor: Cesium.Color.DARK_GREEN, //轮廓颜色深绿色
				show: true
			};
			var cylinderObj = viewer.entities.add({
				name: params.name,
				position: Cesium.Cartesian3.fromDegrees(params.x, params.y, params
					.z), //106.0, 29.83, 200000.0
				cylinder: cylinder
			});

			if (params.zoom == true) {
				viewer.zoomTo(viewer.entities);
			}
		}
	},

	/*绘制圆柱-测试
	 *@params:{object} 可扩展参数 eg：{x:x,y:y,z:z,....}【必选】
	 */
	drawCylinder: function (params) {
		let _this = this;
		let viewer = _this.viewer;
		if (params && params.x != undefined && params.y != undefined && params.z != undefined) {
			var cylinder = {
				length: 1,
				topRadius: 0.2, //圆柱体的顶部半径。
				bottomRadius: 0.2, //    圆柱体底部的半径。
				material: Cesium.Color.GREEN.withAlpha(0.5), //绿色半透明
				outline: true, //轮廓
				outlineColor: Cesium.Color.DARK_GREEN //轮廓颜色深绿色
			};
			if (params.cylinder != undefined) cylinder = params.cylinder;
			var greenCylinder = viewer.entities.add({ //Cylinder圆柱体
				name: 'Green cylinder with black outline',
				position: Cesium.Cartesian3.fromDegrees(params.x, params.y, params.z),
				cylinder: cylinder
			});

			if (params.zoom == true) {
				viewer.zoomTo(viewer.entities);
			}
		}
	},

	/*绘制渐变圆(双圆涟漪)
			*@param:lon {number}经度 eg:-74.01296152309055 【必选】
			*@param:lat {number}纬度 eg:40.70524201566827  【必选】
			*@param:alt {number} eg:129.14366696393927  【必选】
			*@param:maxRadius {number} 最大半径 米 eg:1500 【必选】
			*@param:scanColor {object} 扫描颜色 eg:红new Cesium.Color(1.0, 0.0, 0.0, 1) /绿0,1.0,0,1【必选】
			*@param:duration {number} 持续时间 毫秒 eg:4000 【必选】
			*@param:params {object} 预留参数 【可选】
				eg:{
						labelName:'pipegonObj', //对象标记(用于清除方便) 【可选】
						clear：true,//是否清除上一个（默认false不清除） eg:true、false【可选】
						zoom:true,//是否定位对象(默认不定位) eg:true、false 【可选】
				}
			调用示例:this.Earth.drawCircleScanPostStage(116.976297,33.637425,0,15,new Cesium.Color(1.0, 0.0, 0.0, 1),4000)
	*/
	drawCircleScanPostStage(lon, lat, alt, maxRadius, scanColor, duration, params) {
		let _this = this;
		let viewer = _this.viewer;
		if (params && params.clear) {
			viewer.scene.postProcessStages.removeAll()
		}
		viewer.scene.globe.depthTestAgainstTerrain =
			false; // 设置该属性为true之后，标绘将位于地形的顶部；如果设为false（默认值），那么标绘将位于平面上。缺陷：开启该属性有可能在切换图层时会引发标绘消失的bug。
		var cartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(lon), Cesium.Math.toRadians(lat), alt);
		var ScanSegmentShader =
			"uniform sampler2D colorTexture;\n" + //颜色纹理
			"uniform sampler2D depthTexture;\n" + //深度纹理
			"varying vec2 v_textureCoordinates;\n" + //纹理坐标
			"uniform vec4 u_scanCenterEC;\n" + //中心
			"uniform vec3 u_scanPlaneNormalEC;\n" + //平面法向量
			"uniform float u_radius;\n" + //半径
			"uniform vec4 u_scanColor;\n" + //颜色
			//根据二维向量和深度值 计算距离camera的向量
			"vec4 toEye(in vec2 uv, in float depth)\n" +
			" {\n" +
			" vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n" +
			" vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n" +
			" posInCamera =posInCamera / posInCamera.w;\n" +
			" return posInCamera;\n" +
			" }\n" +
			"vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n" +
			"{\n" +
			"vec3 v01 = point -planeOrigin;\n" +
			"float d = dot(planeNormal, v01) ;\n" +
			"return (point - planeNormal * d);\n" +
			"}\n" +
			"float getDepth(in vec4 depth)\n" +
			"{\n" +
			"float z_window = czm_unpackDepth(depth);\n" +
			"z_window = czm_reverseLogDepth(z_window);\n" +
			"float n_range = czm_depthRange.near;\n" +
			"float f_range = czm_depthRange.far;\n" +
			"return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n" +
			"}\n" +
			"void main()\n" +
			"{\n" +
			"gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n" +
			"float depth = getDepth( texture2D(depthTexture, v_textureCoordinates));\n" +
			"vec4 viewPos = toEye(v_textureCoordinates, depth);\n" +
			"vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n" +
			"float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n" +
			"if(dis < u_radius)\n" +
			"{\n" +
			"float f = 1.0 -abs(u_radius - dis) / u_radius;\n" +
			"f = pow(f, 4.0);\n" +
			"gl_FragColor = mix(gl_FragColor, u_scanColor, f);\n" +
			"}\n" +
			"}\n";
		var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
		var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);
		var _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude,
			cartographicCenter.height + 500);
		var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
		var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z,
			1);
		var _time = (new Date()).getTime();
		var _scratchCartesian4Center = new Cesium.Cartesian4();
		var _scratchCartesian4Center1 = new Cesium.Cartesian4();
		var _scratchCartesian3Normal = new Cesium.Cartesian3();
		var ScanPostStage = new Cesium.PostProcessStage({
			name: 'circleScan' + lon,
			fragmentShader: ScanSegmentShader,
			uniforms: {
				u_scanCenterEC: function () {
					return Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center,
						_scratchCartesian4Center);
				},
				u_scanPlaneNormalEC: function () {
					var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center,
						_scratchCartesian4Center);
					var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix,
						_Cartesian4Center1, _scratchCartesian4Center1);
					_scratchCartesian3Normal.x = temp1.x - temp.x;
					_scratchCartesian3Normal.y = temp1.y - temp.y;
					_scratchCartesian3Normal.z = temp1.z - temp.z;
					Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
					return _scratchCartesian3Normal;
				},
				u_radius: function () {
					return maxRadius * (((new Date()).getTime() - _time) % duration) / duration;
				},
				u_scanColor: scanColor
			}
		});
		viewer.scene.postProcessStages.add(ScanPostStage);
		if (params) {
			if (params.zoom == true) {
				viewer.camera.setView({
					destination: Cesium.Cartesian3.fromDegrees(lon, lat, alt + 50.0)
				});
			}
		}
	},


	/*绘制圆形循环闪烁效果
		 ****采用新绘制对象清除法*****
		 *@param:lon {number} 经度 【必选】
		 *@param:lat {number} 纬度 【必选】
		 *@param:height {number} 高度 【必选】
		 *@param:params {object} 可扩展对象【可选】 
				eg:{
						labelName:'pipegonObj', //对象标记(用于清除方便) 【可选】
						clear：true,//是否清除上一个（默认false不清除） eg:true、false【可选】
						zoom:true,//是否定位对象(默认不定位) eg:true、false 【可选】
				}
	*/
	drawCircleLoop(lon, lat, height, params) {
		let _this = this;
		let viewer = _this.viewer;
		var labelName = "circleObj";
		if (params) {
			if (params.labelName != undefined) {
				labelName = params.labelName;
			}
			if (params.clear == true) {
				_this.remove3DObj([labelName]);
			}
		}
		_this.addScanMaterial();
		//开启深度检测
		viewer.scene.globe.depthTestAgainstTerrain = true;

		//设置扩散样式，包括（颜色、运行周期、图片）
		var center_material = new Cesium.ScanLineMaterialProperty({
			color: Cesium.Color.RED.withAlpha(0.9),
			duration: 2000.0,
			//image: "../sampleData/image/ring2.png"
		});

		var circle = {
			position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
			model: {
				// uri: "http://172.30.80.36:8090/Cesium-1.60/ThirdParty/ZYWebgis/" + 'data/other/modelBig/outside_-1556.gltf',
				color: new Cesium.Color(62.0 / 255.0, 170.0 / 255.0, 231.0 / 255.0, 0.8),
				scale: 20,
			},
			ellipse: {
				semiMinorAxis: 15.0,
				semiMajorAxis: 15.0,
				rotation: Cesium.Math.toRadians(-40.0),
				outline: true,
				outlineColor: Cesium.Color.WHITE,
				outlineWidth: 1,
				stRotation: Cesium.Math.toRadians(150),
				material: center_material
			}
		};
		var circleObj = viewer.entities.add(circle);
		_this.addValueToDrawObjSet(labelName, circleObj);
	},

	/*绘制闪烁渐变圆（cesium1.60支持）
	 *@param:lng {number} 经度 【必选】
	 *@param:lat {number} 纬度 【必选】
	 *@param:alt {number} 高度 【必选】
	 *@param:params {object} 可扩展对象 【可选】
		eg:{
			 labelName:'pipegonObj', //对象标记(用于清除方便) 【可选】
			 clear：true,//是否清除上一个（默认false不清除） eg:true、false【可选】
			 zoom:true,//是否定位对象(默认不定位) eg:true、false 【可选】
			 minAxis:10,//半短轴
			 maxAxis:10,//半长轴
			 ......其他参数可扩展
		}
	*/
	drawFlashingCircle(lng, lat, alt, params) {
		let _this = this;
		let viewer = _this.viewer;
		var labelName = "circleFlashing";
		if (params) {
			if (params.labelName != undefined) {
				labelName = params.labelName;
			}
			if (params.clear == true) {
				_this.remove3DObj([labelName]);
			}
		}
		var semiMinorAxis = 10;
		var semiMajorAxis = 10;
		var color = "RED"
		if (params) {
			if (params.minAxis != undefined && params.minAxis > 0) {
				semiMinorAxis = params.minAxis;
			}
			if (params.maxAxis != undefined && params.maxAxis > 0) {
				semiMajorAxis = params.maxAxis;
			}
			if (params.color != undefined) {
				color = params.color;
			}
		}

		function circle1() {
			var x = 1;
			var minVal = semiMinorAxis;
			var maxVal = semiMajorAxis;
			var offset = 0.2;
			var flog = true;
			var obj1 = {
				name: "圆形区域闪烁",
				position: Cesium.Cartesian3.fromDegrees(lng, lat, alt),
				ellipse: {
					// semiMinorAxis : semiMinorAxis,
					semiMinorAxis: new Cesium.CallbackProperty(function () {
						if (flog) {
							minVal = minVal - offset;
						} else {
							minVal = minVal + offset;
						}
						return minVal;
					}, false),
					// semiMajorAxis : semiMajorAxis,
					semiMajorAxis: new Cesium.CallbackProperty(function () {
						if (flog) {
							maxVal = maxVal - offset;
						} else {
							maxVal = maxVal + offset;
						}
						return maxVal;
					}, false),
					height: 0,
					heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND, //贴地
					material: new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function () {
						if (flog) {
							x = x - 0.03;
							if (x <= 0) {
								flog = false;
							}
						} else {
							x = x + 0.03;
							if (x >= 0.6) {
								flog = true;
							}
						}
						return Cesium.Color[color].withAlpha(x);
					}, false))
				}
			};
			var circleObj1 = viewer.entities.add(obj1);
			_this.addValueToDrawObjSet(labelName, circleObj1);
		}
		circle1();

		function circle2() {
			var x = 1;
			var flog = true;
			var obj2 = {
				name: "圆点point闪烁",
				position: Cesium.Cartesian3.fromDegrees(lng, lat, alt), //+0.03
				point: {
					show: true,
					color: new Cesium.CallbackProperty(function () {
						if (flog) {
							x = x - 0.05;
							if (x <= 0) {
								flog = false;
							}
						} else {
							x = x + 0.05;
							if (x >= 1) {
								flog = true;
							}
						}
						return Cesium.Color[color].withAlpha(x);
					}, false),
					pixelSize: 1, // default: 1
					outlineWidth: 0
				}
			};
			var circleObj2 = viewer.entities.add(obj2);
			_this.addValueToDrawObjSet(labelName, circleObj2);
		}
		circle2();
		if (params && params.zoom == true) {
			viewer.zoomTo(viewer.entities);
		}
	},

	/*绘制饼状图到球体
	*@echarts：{Object} 饼图option 【必选】
	*@params：{object} 参数集合 eg:{
		radius:2000,//饼图半径 【必选】
		lon：116, //中心点经度 【必选】
		lat:29, //中心点纬度 【必选】
		labelName:'' //对象标记，用于定向删除 【可选】
		clear：false, //是否删除上一个此对象 eg:true删除、false不删除（不设置则默认false） 【可选】
		zoom:false,//是否定位此对象 eg:true定位、false不定位（不设置则默认false）  【可选】
		......其他参数根据需要扩展
	}
	*/
	drawPieChart(option, params) {
		let _this = this;
		let viewer = _this.viewer;
		var echarts = _this.Vue.$echarts;
		var canvasDom = document.createElement('canvas');
		canvasDom.width = 400;
		canvasDom.height = 400;
		var myChart = echarts.init(canvasDom);
		myChart.setOption(option);
		myChart.on('finished', () => {
			if (params && params.radius != undefined && params.lon != undefined && params.lat != undefined) {
				viewer.scene.globe.depthTestAgainstTerrain = false;
				var labelName = "pieChartsObj";
				if (params.labelName != undefined) {
					labelName = params.labelName;
				}
				if (params.clear == true) {
					_this.remove3DObj([labelName]);
				}
				var criclePrimitive = _this.getCriclePrimitive(myChart, params)
				var pieChartObj = viewer.scene.primitives.add(criclePrimitive);
				_this.addValueToDrawObjSet(labelName, pieChartObj);
				if (params.zoom) {
					viewer.zoomTo(viewer.scene.primitives);
				}
			}
			myChart.dispose();
			myChart = null;
			canvasDom = null;
		})
	},

	/*获得饼图对象
	 */
	getCriclePrimitive(chart, {
		radius,
		lon,
		lat
	} = {}) {
		var circle = new Cesium.CircleGeometry({
			center: Cesium.Cartesian3.fromDegrees(lon, lat),
			radius: radius
		});
		var circleGeometry = Cesium.CircleGeometry.createGeometry(circle);
		var circleGeometryInstance = new Cesium.GeometryInstance({
			geometry: circleGeometry,
			attributes: {
				color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.ORANGE)
			},
		});
		var criclePrimitive = new Cesium.Primitive({
			geometryInstances: [
				circleGeometryInstance
			],
			appearance: new Cesium.MaterialAppearance({
				material: new Cesium.Material({
					fabric: {
						type: 'Image',
						uniforms: {
							image: chart.getDataURL()
						}
					}
				}),
				// clampToGround: true //开启贴地
			}),
		})
		return criclePrimitive;
	},

	/*************工具条相关微逻辑*************/
	/*地下透视模式
	 *param:flag {boll} 是否透明 eg:true、false 不设置则根据判断设置相反状态(如已透明，则重置为不透明) 【可选】
	 */
	SetUnderViewModel: function (flag) {
		var _this = this;
		let scene = _this.viewer.scene;
		let globe = scene.globe;
		if (typeof (flag) == "boolean") {
			if (flag) {
				scene.screenSpaceCameraController.enableCollisionDetection = false;
				globe.translucency.enabled = true;
				globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar(400.0, 0.0, 1000.0, 1.0);
				globe.translucency.frontFaceAlphaByDistance.nearValue = 0.0;
				globe.translucency.frontFaceAlphaByDistance.farValue = 1.0
				_this.alert("开启地下透视模式", "success", 2500);
			} else {
				scene.screenSpaceCameraController.enableCollisionDetection = true;
				globe.translucency.enabled = false;
				_this.alert("关闭地下透视模式", "success", 2500);
			}
		} else {
			let istrue = scene.screenSpaceCameraController.enableCollisionDetection;
			if (istrue) {
				scene.screenSpaceCameraController.enableCollisionDetection = false;
				globe.translucency.enabled = true;
				globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar(100.0, 0.0, 400.0, 1.0);
				globe.translucency.frontFaceAlphaByDistance.nearValue = 0.0;
				globe.translucency.frontFaceAlphaByDistance.farValue = 1.0;
				_this.alert("开启地下透视模式", "success", 2500);
			} else {
				scene.screenSpaceCameraController.enableCollisionDetection = true;
				globe.translucency.enabled = false;
				_this.alert("关闭地下透视模式", "success", 2500);
			}
		}
	},


	/*点击监听
	 *@param:options {object} 参数对象集合 eg:不设置则高亮查询管线【可选/可拓展】
	 eg:{//除了属性查询需求外，有时想获得1、点击点坐标。2、点击管US_ID和服务名，而不是弹气泡
		 type:'',// eg:①'queryPipe'返回管信息并高亮管（此处不区分管点管线） ②'getCoord'仅获得坐标信息 ③
	 }
	 *@param:callback {function} 回调函数 【可选】
 */
	clickPoint: function (options, callback) {
		this.clearHandler();
		let _this = this;
		let viewer = _this.viewer;
		viewer.scene.globe.depthTestAgainstTerrain = false;
		let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		handler.setInputAction(function (click) {
			let pickingEntity = viewer.scene.pick(click.position);
			let cartesian = viewer.scene.pickPosition(click.position);
			let coord;
			if (cartesian != undefined) {
				let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
				let lontable = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7) * 1;
				let lattable = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7) * 1;
				let height = cartographic.height;
				coord = {
					lon: lontable,
					lat: lattable,
					height: height
				};
			}
			if (options != undefined && callback != undefined) { //属性查询
				if (typeof callback == "function") {
					callback(pickingEntity, coord);
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		handler.setInputAction(function () {
			_this.clearHandler();
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
		_this.ClickHandler = handler;
	},

	/*点击查询
	 */
	clickQuery: function () {

	},

	/*鼠标左键单击监听
	 */
	leftClickHander: function (callback) {
		var _this = this;
		_this.viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
			var pickedFeature = viewer.scene.pick(movement.position);
			if (typeof (pickedFeature) != "undefined") //鼠标是否点到线上
			{
				var name = pickedFeature.id.name; //获取每条线的nameID
				if (typeof callback == "function") {
					callback(name, pickedFeature)
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	},


	/****************飞行定位模块*******************/
	/*定位到矩形 (传入坐标极值定位区域)
	 *@param:minLng {number} 最小经度 【必选】
	 *@param:maxLng {number} 最大经度 【必选】
	 *@param:minLat {number} 最小纬度 【必选】
	 *@param:maxLat {number} 最大纬度 【必选】
	 */
	FlyToRectangle: function (minLng, maxLng, minLat, maxLat) {
		var west = parseFloat(minLng);
		var east = parseFloat(maxLng);
		var south = parseFloat(minLat);
		var north = parseFloat(maxLat);
		if (typeof west == "number" && typeof east == "number" && typeof south == "number" && typeof north ==
			"number") {
			this.viewer.camera.flyTo({
				destination: Cesium.Rectangle.fromDegrees(west, south, east, north)
			});
		}
	},
	/*定位到点 (传入经纬度视角高，俯视视图，飞到一个位置)
	 *@param:lng {number} 经度 【必选】
	 *@param:lat {number} 经度 【必选】
	 *@param:height {number} 高程 【必选】
	 *@param:heading {number} 偏航(方位)角 【可选】
	 *@param:pitch {number} 俯仰角 【可选】
	 *@param:roll {number} 旋转角 【可选】
	 *@param:callback {function} 飞行完成回调 【可选】
	 */
	FlyToPt: function (lng, lat, height, heading, pitch, roll, callback) {
		var x = parseFloat(lng);
		var y = parseFloat(lat);
		var h = parseFloat(height);
		if (typeof x == "number" && typeof y == "number" && typeof h == "number") {
			var option;
			if (heading != undefined || pitch != undefined || roll != undefined) {
				option = {
					destination: Cesium.Cartesian3.fromDegrees(x, y, h),
					orientation: {
						heading: Cesium.Math.toRadians(heading),
						pitch: Cesium.Math.toRadians(pitch), // 从上往下看为-90
						roll: Cesium.Math.toRadians(roll)
					},
				}
				if (typeof callback == "function") {
					option.complete = callback;
				}
			} else {
				option = {
					destination: Cesium.Cartesian3.fromDegrees(x, y, h)
				};
			}
			this.viewer.camera.flyTo(option);
		}
	},

	/*根据绘制线面时的坐标定位区域（绘制自带的定位视角满足不了需求）
	 *@param:points {array} 绘制线、面时的经纬度坐标数据 eg:[{X:117,Y:29,Z:10},{X:117,Y:29,Z:10},{X:117,Y:29,Z:10},.....] 至少三个点【必选】
	 */
	FlyToPoints(points) {
		let minLng = this.Vue.index._getTypeValByAttr(points, "X", "min");
		let maxLng = this.Vue.index._getTypeValByAttr(points, "X", "max");
		let minLat = this.Vue.index._getTypeValByAttr(points, "Y", "min");
		let maxLat = this.Vue.index._getTypeValByAttr(points, "Y", "max");
		this.FlyToRectangle(minLng, maxLng, minLat, maxLat);
	},

	/*飞行到中国
	 */
	FlyToChina: function () {
		this.viewer.scene.camera.setView({
			destination: new Cesium.Cartesian3.fromDegrees(117.002743, 33.638562, 25030800),
			orientation: {
				heading: Cesium.Math.toRadians(0.0),
				pitch: Cesium.Math.toRadians(-90.0), // 从上往下看为-90
				roll: 0
			}
		});
	},


	/*常用*/
	/*Vue提示信息(可自动关闭)---供本页面调用
		*@param:text {String} 类型 eg'请点击管线!'   【必选】
		*@param:type {String} 类型 eg:可选 success/warning/info/error/  默认：info 【必选】
		*@param:time {String} 自动关闭时间 eg:1000   【可选】
		*@param:params {Object} 预留参数   【可选】
		使用方式
		 1、this.alert("请选择管线")   默认info，2000毫秒后关闭
		 2、this.alert("请选择管线","warning") 默认2000毫秒后关闭警示框
		 3、this.alert("请选择管线","warning",2500) 2500毫秒后关闭警示框
	*/
	alert: function (text, type, time, params) {
		var Vue = this.Vue;
		if (text) {
			if (!type) type = 'info';
			if (!time) time = 3500;
			if (type) {
				switch (type) {
					case "success":
						Vue.$notify({
							title: '提示',
							type: 'success',
							duration: time,
							message: text,
							position: 'bottom-right'
						})
						break;
					case "warning":
						Vue.$notify({
							title: '提示',
							type: 'warning',
							duration: time,
							message: text,
							position: 'bottom-right'
						})
						break;
					case "info":
						Vue.$notify({
							title: '提示',
							type: 'info',
							duration: time,
							message: text,
							position: 'bottom-right'
						})
						break;
					case "error":
						Vue.$notify({
							title: '提示',
							type: 'error',
							duration: time,
							message: text,
							position: 'bottom-right'
						})
						break;

					//只存在一个的通知 add by CHL
					case "onlyAlert":
						Vue.$notify.closeAll(); // 这句话主要是关闭之前打开的所有Notification 其他类型同理
						Vue.$notify({
							title: '属性展示',
							type: 'success',
							duration: 10000,
							dangerouslyUseHTMLString: true,
							message: text,
							position: 'bottom-right'
						})
						break;
				}
			}
		}
	},



	/**
	 * 鼠标点击获取属性
	 */
	getDataByClickEvent: function (imageryProvider) {
		var _this = this
		const viewer = this.viewer;
		const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		handler.setInputAction(function (movement) {
			const ray = viewer.camera.getPickRay(movement.position);
			const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
			if (cartesian) {
				var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
				if (cartographic) {
					var xy = new Cesium.Cartesian2();
					var alti = viewer.camera.positionCartographic.height;
					var level = _this.getLevel(alti);
					if (imageryProvider.ready) {
						xy = imageryProvider.tilingScheme.positionToTileXY(cartographic, level, xy);
						var promise = imageryProvider.pickFeatures(xy.x, xy.y, level, cartographic
							.longitude, cartographic.latitude);
						console.log(promise, '==属性');
						Cesium.when(promise, function (data) {
							//  console.log(data,'==属性');
							var layerInfo = data[0].description
							if (layerInfo && layerInfo.length > 0) {
								//这里就得到了查询结果
								console.log(data, '==属性');
								//document.getElementById('msg').innerHTML = layerInfo
								_this.renderPopup(layerInfo, movement.position)
								//	_this.alert(layerInfo, "onlyAlert", 2500);
							}
						});
					}
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

	},
	selectEntity: function (value) {
		if (this.viewer._selectedEntity !== value) {

			this.viewer._selectedEntity = value;
			var selectionIndicatorViewModel = defined(this.viewer._selectionIndicator) ? this.viewer
				._selectionIndicator
				.viewModel : undefined;
			if (defined(value)) {
				if (defined(selectionIndicatorViewModel)) {
					selectionIndicatorViewModel.animateAppear();
				}
			} else if (defined(selectionIndicatorViewModel)) {
				selectionIndicatorViewModel.animateDepart();
			}
			this.viewer._selectedEntityChanged.raiseEvent(value);
		}
	},
	handlerPolygon: function () { //空间查询
		var _this = this
		const viewer = this.viewer;
		var handlerPolygon = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Polygon);
		var tooltip = createTooltip(document.body);
		$("#search").click(function () {
			handlerPolygon.activate();
		});
		handlerPolygon.activeEvt.addEventListener(function (isActive) {
			if (isActive == true) {
				viewer.enableCursorStyle = false;
				viewer._element.style.cursor = '';

			} else {
				viewer.enableCursorStyle = true;

			}
		});
		handlerPolygon.movingEvt.addEventListener(function (windowPosition) {
			if (windowPosition.x < 210 && windowPosition.y < 120) {
				tooltip.setVisible(false);
				return;
			}
			if (handlerPolygon.isDrawing) {
				tooltip.showAt(windowPosition, '<p>点击确定查询区域中间点</p><p>右键单击结束绘制</p>');
			} else {
				tooltip.showAt(windowPosition, '<p>点击绘制查询区域第一个点</p>');
			}
		});
		handlerPolygon.drawEvt.addEventListener(function (result) {
			tooltip.setVisible(false);
			handlerPolygon.polygon.show = false;
			handlerPolygon.polyline.show = false;

			var positions = result.object.positions;
			console.log(positions, 'positions');
			var geometries = [];
			for (var i = 0; i < positions.length; i++) {
				var position = positions[i];
				var cartographic = Cesium.Cartographic.fromCartesian(position);
				var longitude = Cesium.Math.toDegrees(cartographic.longitude);
				var latitude = Cesium.Math.toDegrees(cartographic.latitude);

				var queryPoint = { // 查询点对象
					x: longitude,
					y: latitude
				};
				geometries.push(queryPoint)
			}


			alert(geometries);
		});
	},
	getLevel: function (height) {
		if (height > 48000000) {
			return 0;
		} else if (height > 24000000) {
			return 1;
		} else if (height > 12000000) {
			return 2;
		} else if (height > 6000000) {
			return 3;
		} else if (height > 3000000) {
			return 4;
		} else if (height > 1500000) {
			return 5;
		} else if (height > 750000) {
			return 6;
		} else if (height > 375000) {
			return 7;
		} else if (height > 187500) {
			return 8;
		} else if (height > 93750) {
			return 9;
		} else if (height > 46875) {
			return 10;
		} else if (height > 23437.5) {
			return 11;
		} else if (height > 11718.75) {
			return 12;
		} else if (height > 5859.38) {
			return 13;
		} else if (height > 2929.69) {
			return 14;
		} else if (height > 1464.84) {
			return 15;
		} else if (height > 732.42) {
			return 16;
		} else if (height > 366.21) {
			return 17;
		} else {
			return 18;
		}
	},
	addModels: function () {
		var _this = this
		const viewer = this.viewer;
		//加载gltf格式数据到cesium

		var scene = viewer.scene;

		var position = new Cesium.Cartesian3.fromDegrees(3.24058, 27.16592, 5.4);
		var heading = Cesium.Math.toRadians(0.0);
		var pitch = Cesium.Math.toRadians(0.0);
		var roll = 0;
		var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
		var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
		var entity = viewer.entities.add({
			position: position,
			orientation: orientation,
			model: {
				uri: "../../../common/data/gltf/test.gltf",
				minimumPixelSize: 128,
				maximumScale: 2000
			},
			description: '风机模型'
		});
		//   viewer.trackedEntity = entity;
	},
	createHeatMap: function (max, data) {
		// 创建元素
		var heatDoc = document.createElement("div");
		heatDoc.setAttribute("style", "width:1000px;height:1000px;margin: 0px;display: none;");
		document.body.appendChild(heatDoc);
		// 创建热力图对象
		var heatmap = h337.create({
			container: heatDoc,
			radius: 20,
			maxOpacity: .5,
			minOpacity: 0,
			blur: .75,
			gradient: {
				'0.9': 'red',
				'0.8': 'orange',
				'0.7': 'yellow',
				'0.5': 'blue',
				'0.3': 'green',
			},
		});
		// 添加数据
		heatmap.setData({
			max: max,
			data: data
		});
		return heatmap;
	},

	// 生成len个随机数据
	getData: function (len) {
		//构建一些随机数据点
		var points = [];
		var max = 0;
		var width = 1000;
		var height = 1000;
		while (len--) {
			var val = Math.floor(Math.random() * 1000);
			max = Math.max(max, val);
			var point = {
				x: Math.floor(Math.random() * width),
				y: Math.floor(Math.random() * height),
				value: val
			};
			points.push(point);
		}
		return {
			max: max,
			data: points
		}
	},
	// 创建正方形 绑定热力图 
	creatRectangle: function (coordinate, heatMap) {
		var _this = this
		const viewer = this.viewer;
		//加载gltf格式数据到cesium
		var scene = viewer.scene;
		viewer.entities.add({
			name: 'Rotating rectangle with rotating texture coordinate',
			show: true,
			rectangle: {
				coordinates: Cesium.Rectangle.fromDegrees(coordinate[0], coordinate[1], coordinate[2], coordinate[3]),
				material: heatMap._renderer.canvas // 核心语句，填充热力图
			}
		});
	},
	setCesuimMapHeat: function () {
		var that = this;
		// 第一个热力图
		var coordinate1 = [-109.0, 10.0, -80.0, 35.0];
		var heatMap1 = that.createHeatMap(that.getData(1000).max, that.getData(1000).data);
		that.creatRectangle(coordinate1, heatMap1);
	},
	queryRequestWFS(keyword) { //新增查询功能
		const viewer = this.viewer;
		var mapLayers = ["jianzhu", "shitang", "sushe"]; //图层名字
		//We_MAP 工作区名称
		$.ajax({
			type: 'post',
			url: 'http://119.96.237.23:8180/geoserver/CuData/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=CuData%3A项目数据&maxFeatures=50&outputFormat=application%2Fjson',
			data: {
				"cql_filter": "NewField_1 like '%" + keyword + "%'"
			},
			//name+like+%27%25餐厅%25%27   name like '%餐厅%'
			async: false,
			success: function (data) {
				if (data.features.length > 0) {
					var datasources = Cesium.GeoJsonDataSource.load(data);
					viewer.dataSources.add(datasources);

				}
			}
		});
	},
	queryRequestWFSByTable(keyword, columns, tablename) { //新增查询功能
		let that = this;
		const viewer = this.viewer;
		keyword = keyword.substring(0, keyword.length - 1);
		console.log(keyword, 'keyword');
		//We_MAP 工作区名称
		$.ajax({
			type: 'post',
			url: 'http://119.96.237.23:8180/geoserver/CuData/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=CuData%3A' + tablename + '&maxFeatures=50000&outputFormat=application%2Fjson',
			data: {
				"cql_filter": "" + columns + " in (" + keyword + ")"
			},
			//name+like+%27%25餐厅%25%27   name like '%餐厅%'
			async: false,
			success: function (data) {
				console.log(data, 'data');
				if (data.features.length > 0) {
					var datasources = Cesium.GeoJsonDataSource.load(data);
					viewer.dataSources.add(datasources);
				}
			}
		});
	},

	removedataSources() {
		const viewer = this.viewer;
		// viewer.dataSources.remove(this.datasource, true);
		viewer.dataSources.removeAll();
	}


}
